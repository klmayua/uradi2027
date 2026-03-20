"""
USSD Session Management Service for URADI-360
Handles multi-step USSD menus with Redis-backed session storage
"""

import os
import json
import redis
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict

# Redis client for session storage
redis_client = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    encoding="utf-8",
    decode_responses=True
)


class USSDState(Enum):
    """USSD session states"""
    MAIN_MENU = "main_menu"
    SELECT_LGA = "select_lga"
    SELECT_WARD = "select_ward"
    SELECT_POLLING_UNIT = "select_polling_unit"
    SUBMIT_FEEDBACK = "submit_feedback"
    FEEDBACK_CATEGORY = "feedback_category"
    FEEDBACK_TEXT = "feedback_text"
    CONFIRM_SUBMISSION = "confirm_submission"
    CHECK_STATUS = "check_status"
    LANGUAGE_SELECT = "language_select"
    END = "end"


@dataclass
class USSDSession:
    """USSD session data"""
    phone_number: str
    tenant_id: str
    state: str
    language: str = "en"  # en, ha, ff
    data: Dict[str, Any] = None
    created_at: str = None
    expires_at: str = None
    last_activity: str = None
    message_count: int = 0

    def __post_init__(self):
        if self.data is None:
            self.data = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.expires_at is None:
            self.expires_at = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        if self.last_activity is None:
            self.last_activity = datetime.utcnow().isoformat()


class USSDService:
    """
    USSD Service for handling multi-step menus
    Supports English, Hausa, and Fulfulde
    """

    # Session timeout in seconds
    SESSION_TIMEOUT = 300  # 5 minutes

    # Translations
    MESSAGES = {
        "en": {
            "welcome": "Welcome to URADI-360 Citizen Feedback\n1. Submit Feedback\n2. Check Status\n3. Change Language",
            "select_lga": "Select your LGA:\n{lgas}\n0. Back",
            "select_ward": "Select your Ward:\n{wards}\n0. Back",
            "feedback_category": "Select category:\n1. Governance\n2. Security\n3. Economy\n4. Infrastructure\n5. Other\n0. Back",
            "enter_feedback": "Enter your feedback (max 500 chars):\n0. Back",
            "confirm": "Confirm submission:\n{preview}\n1. Yes\n2. No",
            "success": "Thank you! Your feedback has been recorded. Reference: {ref}",
            "status": "Your feedback status:\n{status_list}",
            "no_feedback": "No feedback found for your number.",
            "language_select": "Select language:\n1. English\n2. Hausa\n3. Fulfulde",
            "invalid_input": "Invalid input. Please try again.",
            "timeout": "Session expired. Please dial again.",
            "goodbye": "Thank you for using URADI-360. Goodbye!",
        },
        "ha": {
            "welcome": "Barka da zuwa URADI-360\n1. Saka Ra'ayi\n2. Duba Matsayi\n3. Canza Harshe",
            "select_lga": "Zaɓi LGA naka:\n{lgas}\n0. Baya",
            "select_ward": "Zaɓi Ward naka:\n{wards}\n0. Baya",
            "feedback_category": "Zaɓi nau'i:\n1. Gwamnati\n2. Tsaro\n3. Tattalin Arziki\n4. Kayayyaki\n5. Sauran\n0. Baya",
            "enter_feedback": "Shigar da ra'ayinka (har 500 haruffa):\n0. Baya",
            "confirm": "Tabbatar da turawa:\n{preview}\n1. I\n2. A'a",
            "success": "Na gode! An yi rikodin ra'ayinka. Lissafi: {ref}",
            "status": "Matsayin ra'ayinka:\n{status_list}",
            "no_feedback": "Babu ra'ayi da aka samu don lambarka.",
            "language_select": "Zaɓi harshe:\n1. Turanci\n2. Hausa\n3. Fulfulde",
            "invalid_input": "Shigarwa mara kyau. Da fatan za a sake gwadawa.",
            "timeout": "Lokacin ya kare. Da fatan za a sake daila.",
            "goodbye": "Na gode da amfani da URADI-360. Barka da safe!",
        },
        "ff": {
            "welcome": "A jaɓɓaama e URADI-360\n1. Naatnu Goggo\n2. Ƴeewtu Ngonka\n3. Waylu ɗemngal",
            "select_lga": "Suɓo LGA ma:\n{lgas}\n0. Caggal",
            "select_ward": "Suɓo Ward ma:\n{wards}\n0. Caggal",
            "feedback_category": "Suɓo fannu:\n1. Gollal\n2. Ndeena\n3. Econoomi\n4. Kuuɗe\n5. Goɗɗe\n0. Caggal",
            "enter_feedback": "Naatnu goggo ma (haa 500 alkule):\n0. Caggal",
            "confirm": "Ƴeewtu naatnu:\n{preview}\n1. Iyo\n2. Non",
            "success": "A jaɓɓaama! Goggo ma ɗon taƴaama. Limere: {ref}",
            "status": "Ngonki goggo ma:\n{status_list}",
            "no_feedback": "Goggo woodaani wonde numbere ma.",
            "language_select": "Suɓo ɗemngal:\n1. Ingireeji\n2. Hawsa\n3. Pulaar",
            "invalid_input": "Naatnu moƴƴaani. Ƴeewtu kadi.",
            "timeout": "Waktu ma timmiima. Ƴeewtu kadi.",
            "goodbye": "A jaɓɓaama e URADI-360. Ɓeeku!",
        }
    }

    def __init__(self):
        self.redis = redis_client

    def _get_session_key(self, phone_number: str) -> str:
        """Generate Redis key for session"""
        return f"ussd:session:{phone_number}"

    def get_session(self, phone_number: str) -> Optional[USSDSession]:
        """Get existing session from Redis"""
        key = self._get_session_key(phone_number)
        data = self.redis.get(key)

        if not data:
            return None

        try:
            session_dict = json.loads(data)
            session = USSDSession(**session_dict)

            # Check if expired
            expires = datetime.fromisoformat(session.expires_at)
            if datetime.utcnow() > expires:
                self.end_session(phone_number)
                return None

            return session
        except Exception as e:
            print(f"Error parsing session: {e}")
            return None

    def create_session(self, phone_number: str, tenant_id: str) -> USSDSession:
        """Create new USSD session"""
        session = USSDSession(
            phone_number=phone_number,
            tenant_id=tenant_id,
            state=USSDState.MAIN_MENU.value
        )
        self._save_session(session)
        return session

    def _save_session(self, session: USSDSession):
        """Save session to Redis"""
        key = self._get_session_key(session.phone_number)
        session.last_activity = datetime.utcnow().isoformat()
        self.redis.setex(
            key,
            self.SESSION_TIMEOUT,
            json.dumps(asdict(session))
        )

    def update_session(self, session: USSDSession, new_state: str = None, data_update: Dict = None):
        """Update session state and data"""
        if new_state:
            session.state = new_state
        if data_update:
            session.data.update(data_update)
        session.message_count += 1
        self._save_session(session)

    def end_session(self, phone_number: str):
        """End and delete session"""
        key = self._get_session_key(phone_number)
        self.redis.delete(key)

    def get_message(self, key: str, language: str = "en") -> str:
        """Get translated message"""
        lang_messages = self.MESSAGES.get(language, self.MESSAGES["en"])
        return lang_messages.get(key, self.MESSAGES["en"][key])

    def process_input(self, phone_number: str, tenant_id: str, text: str, session_id: str = None) -> str:
        """
        Process USSD input and return response

        Args:
            phone_number: User's phone number
            tenant_id: Tenant ID for multi-tenancy
            text: User input (empty for new session)
            session_id: Optional session ID from provider

        Returns:
            USSD response text
        """
        # Get or create session
        session = self.get_session(phone_number)

        if not session:
            if text == "":
                # New session
                session = self.create_session(phone_number, tenant_id)
                return self._render_main_menu(session)
            else:
                # Session expired
                return self.get_message("timeout", "en")

        # Update tenant if needed
        if session.tenant_id != tenant_id:
            session.tenant_id = tenant_id

        # Process based on current state
        return self._process_state(session, text)

    def _process_state(self, session: USSDSession, text: str) -> str:
        """Process input based on current state"""
        state = session.state

        if text == "0":
            # Go back
            return self._handle_back(session)

        handlers = {
            USSDState.MAIN_MENU.value: self._handle_main_menu,
            USSDState.SELECT_LGA.value: self._handle_lga_selection,
            USSDState.SELECT_WARD.value: self._handle_ward_selection,
            USSDState.FEEDBACK_CATEGORY.value: self._handle_category_selection,
            USSDState.FEEDBACK_TEXT.value: self._handle_feedback_text,
            USSDState.CONFIRM_SUBMISSION.value: self._handle_confirmation,
            USSDState.CHECK_STATUS.value: self._handle_status_check,
            USSDState.LANGUAGE_SELECT.value: self._handle_language_selection,
        }

        handler = handlers.get(state, self._handle_unknown)
        return handler(session, text)

    def _render_main_menu(self, session: USSDSession) -> str:
        """Render main menu"""
        return self.get_message("welcome", session.language)

    def _handle_main_menu(self, session: USSDSession, text: str) -> str:
        """Handle main menu selection"""
        if text == "1":
            # Submit feedback - show LGA selection
            self.update_session(session, USSDState.SELECT_LGA.value)
            return self._get_lga_menu(session)
        elif text == "2":
            # Check status
            self.update_session(session, USSDState.CHECK_STATUS.value)
            return self._get_status(session)
        elif text == "3":
            # Change language
            self.update_session(session, USSDState.LANGUAGE_SELECT.value)
            return self.get_message("language_select", session.language)
        else:
            return self.get_message("invalid_input", session.language)

    def _get_lga_menu(self, session: USSDSession) -> str:
        """Get LGA selection menu"""
        # In production, fetch from database
        # For now, use sample LGAs
        sample_lgas = [
            "1. Municipal",
            "2. Dala",
            "3. Fagge",
            "4. Gwale",
            "5. Kumbotso"
        ]
        lgas_text = "\n".join(sample_lgas[:5])
        return self.get_message("select_lga", session.language).format(lgas=lgas_text)

    def _handle_lga_selection(self, session: USSDSession, text: str) -> str:
        """Handle LGA selection"""
        try:
            lga_index = int(text)
            if 1 <= lga_index <= 5:
                # Store LGA and show wards
                self.update_session(
                    session,
                    USSDState.SELECT_WARD.value,
                    {"lga_index": lga_index}
                )
                return self._get_ward_menu(session)
            else:
                return self.get_message("invalid_input", session.language)
        except ValueError:
            return self.get_message("invalid_input", session.language)

    def _get_ward_menu(self, session: USSDSession) -> str:
        """Get ward selection menu"""
        # In production, fetch wards for selected LGA
        sample_wards = [
            "1. Ward 1",
            "2. Ward 2",
            "3. Ward 3",
            "4. Ward 4",
            "5. Ward 5"
        ]
        wards_text = "\n".join(sample_wards[:5])
        return self.get_message("select_ward", session.language).format(wards=wards_text)

    def _handle_ward_selection(self, session: USSDSession, text: str) -> str:
        """Handle ward selection"""
        try:
            ward_index = int(text)
            if 1 <= ward_index <= 5:
                # Store ward and show category selection
                self.update_session(
                    session,
                    USSDState.FEEDBACK_CATEGORY.value,
                    {"ward_index": ward_index}
                )
                return self.get_message("feedback_category", session.language)
            else:
                return self.get_message("invalid_input", session.language)
        except ValueError:
            return self.get_message("invalid_input", session.language)

    def _handle_category_selection(self, session: USSDSession, text: str) -> str:
        """Handle feedback category selection"""
        categories = {
            "1": "governance",
            "2": "security",
            "3": "economy",
            "4": "infrastructure",
            "5": "other"
        }

        if text in categories:
            self.update_session(
                session,
                USSDState.FEEDBACK_TEXT.value,
                {"category": categories[text]}
            )
            return self.get_message("enter_feedback", session.language)
        else:
            return self.get_message("invalid_input", session.language)

    def _handle_feedback_text(self, session: USSDSession, text: str) -> str:
        """Handle feedback text input"""
        if len(text) > 500:
            text = text[:500] + "..."

        self.update_session(
            session,
            USSDState.CONFIRM_SUBMISSION.value,
            {"feedback_text": text}
        )

        # Show confirmation preview
        preview = f"Category: {session.data.get('category', 'N/A')}\n"
        preview += f"Feedback: {text[:100]}..."

        return self.get_message("confirm", session.language).format(preview=preview)

    def _handle_confirmation(self, session: USSDSession, text: str) -> str:
        """Handle confirmation"""
        if text == "1":
            # Yes - submit feedback
            return self._submit_feedback(session)
        elif text == "2":
            # No - go back to main menu
            self.update_session(session, USSDState.MAIN_MENU.value)
            return self.get_message("welcome", session.language)
        else:
            return self.get_message("invalid_input", session.language)

    def _submit_feedback(self, session: USSDSession) -> str:
        """Submit feedback to database"""
        try:
            # Generate reference number
            ref = f"UF{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{session.phone_number[-4:]}"

            # In production, save to database here
            # For now, just log it
            print(f"Feedback submitted: {ref}")
            print(f"Data: {session.data}")

            # End session
            self.end_session(session.phone_number)

            return self.get_message("success", session.language).format(ref=ref)
        except Exception as e:
            print(f"Error submitting feedback: {e}")
            return "Error submitting feedback. Please try again."

    def _get_status(self, session: USSDSession) -> str:
        """Get feedback status for phone number"""
        # In production, query database for feedback by phone number
        # For now, return sample data
        self.end_session(session.phone_number)
        return self.get_message("no_feedback", session.language)

    def _handle_status_check(self, session: USSDSession, text: str) -> str:
        """Handle status check (any input ends session)"""
        self.end_session(session.phone_number)
        return self.get_message("goodbye", session.language)

    def _handle_language_selection(self, session: USSDSession, text: str) -> str:
        """Handle language selection"""
        languages = {
            "1": "en",
            "2": "ha",
            "3": "ff"
        }

        if text in languages:
            session.language = languages[text]
            self.update_session(session, USSDState.MAIN_MENU.value)
            return self.get_message("welcome", session.language)
        else:
            return self.get_message("invalid_input", session.language)

    def _handle_back(self, session: USSDSession) -> str:
        """Handle back navigation"""
        state_transitions = {
            USSDState.SELECT_LGA.value: USSDState.MAIN_MENU.value,
            USSDState.SELECT_WARD.value: USSDState.SELECT_LGA.value,
            USSDState.FEEDBACK_CATEGORY.value: USSDState.SELECT_WARD.value,
            USSDState.FEEDBACK_TEXT.value: USSDState.FEEDBACK_CATEGORY.value,
            USSDState.CONFIRM_SUBMISSION.value: USSDState.FEEDBACK_TEXT.value,
            USSDState.LANGUAGE_SELECT.value: USSDState.MAIN_MENU.value,
        }

        new_state = state_transitions.get(session.state, USSDState.MAIN_MENU.value)
        self.update_session(session, new_state)

        # Return appropriate menu
        if new_state == USSDState.MAIN_MENU.value:
            return self.get_message("welcome", session.language)
        elif new_state == USSDState.SELECT_LGA.value:
            return self._get_lga_menu(session)
        elif new_state == USSDState.SELECT_WARD.value:
            return self._get_ward_menu(session)
        elif new_state == USSDState.FEEDBACK_CATEGORY.value:
            return self.get_message("feedback_category", session.language)
        elif new_state == USSDState.FEEDBACK_TEXT.value:
            return self.get_message("enter_feedback", session.language)
        else:
            return self.get_message("welcome", session.language)

    def _handle_unknown(self, session: USSDSession, text: str) -> str:
        """Handle unknown state"""
        self.end_session(session.phone_number)
        return self.get_message("goodbye", session.language)

    def get_session_stats(self, phone_number: str) -> Optional[Dict]:
        """Get session statistics"""
        session = self.get_session(phone_number)
        if not session:
            return None

        return {
            "phone_number": session.phone_number,
            "state": session.state,
            "language": session.language,
            "message_count": session.message_count,
            "created_at": session.created_at,
            "expires_at": session.expires_at,
            "data": session.data
        }


# Singleton instance
ussd_service = USSDService()
