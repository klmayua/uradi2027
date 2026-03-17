"""
Email Service Integration
SendGrid email sending for notifications, reports, and alerts
"""

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """SendGrid email service for URADI-360"""
    
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@uradi360.com")
        self.from_name = os.getenv("SENDGRID_FROM_NAME", "URADI-360")
        self.client = None
        
        if self.api_key:
            self.client = SendGridAPIClient(self.api_key)
    
    def is_configured(self) -> bool:
        """Check if SendGrid is properly configured"""
        return self.client is not None and self.api_key
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        content: str,
        content_type: str = "text/html",
        from_email: Optional[str] = None,
        from_name: Optional[str] = None
    ) -> dict:
        """
        Send a single email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            content: Email body (HTML or text)
            content_type: 'text/html' or 'text/plain'
            from_email: Sender email (optional, uses default)
            from_name: Sender name (optional, uses default)
        
        Returns:
            dict: Response with status and message_id
        """
        if not self.is_configured():
            logger.error("SendGrid not configured. Set SENDGRID_API_KEY environment variable.")
            return {"success": False, "error": "SendGrid not configured"}
        
        try:
            from_email_obj = Email(
                email=from_email or self.from_email,
                name=from_name or self.from_name
            )
            to_email_obj = To(to_email)
            content_obj = Content(content_type, content)
            
            mail = Mail(
                from_email=from_email_obj,
                to_emails=to_email_obj,
                subject=subject,
                html_content=content if content_type == "text/html" else None,
                plain_text_content=content if content_type == "text/plain" else None
            )
            
            response = self.client.send(mail)
            
            return {
                "success": True,
                "message_id": response.headers.get("X-Message-Id"),
                "status_code": response.status_code
            }
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_bulk_email(
        self,
        to_emails: List[str],
        subject: str,
        content: str,
        content_type: str = "text/html"
    ) -> dict:
        """
        Send email to multiple recipients
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            content: Email body
            content_type: 'text/html' or 'text/plain'
        
        Returns:
            dict: Response with status and summary
        """
        if not self.is_configured():
            logger.error("SendGrid not configured")
            return {"success": False, "error": "SendGrid not configured"}
        
        results = []
        success_count = 0
        failed_count = 0
        
        for email in to_emails:
            result = self.send_email(email, subject, content, content_type)
            results.append({"email": email, **result})
            
            if result.get("success"):
                success_count += 1
            else:
                failed_count += 1
        
        return {
            "success": failed_count == 0,
            "total": len(to_emails),
            "success_count": success_count,
            "failed_count": failed_count,
            "results": results
        }
    
    def send_weekly_report(
        self,
        to_email: str,
        report_data: dict
    ) -> dict:
        """
        Send weekly sentiment report
        
        Args:
            to_email: Recipient email
            report_data: Report data dictionary
        
        Returns:
            dict: Response with status
        """
        subject = f"URADI-360 Weekly Report - {report_data.get('period', 'Current Week')}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #C8A94E;">URADI-360 Weekly Intelligence Report</h2>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Sentiment Overview</h3>
                <p><strong>Overall Sentiment:</strong> {report_data.get('overall_sentiment', 'N/A')}/100</p>
                <p><strong>Trend:</strong> {report_data.get('sentiment_trend', 'stable')}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>Key Metrics</h3>
                <ul>
                    <li>Total Voter Contacts: {report_data.get('total_contacts', 'N/A')}</li>
                    <li>Active Field Agents: {report_data.get('active_agents', 'N/A')}</li>
                    <li>Incidents Reported: {report_data.get('incidents', 'N/A')}</li>
                </ul>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>Top Performing LGAs</h3>
                <p>{', '.join(report_data.get('top_lgas', []))}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>Alerts</h3>
                <p>{len(report_data.get('alerts', []))} alerts require attention.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                This is an automated report from URADI-360. 
                <a href="https://uradi360.vercel.app">Access Dashboard</a>
            </p>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content, "text/html")
    
    def send_alert(
        self,
        to_emails: List[str],
        alert_type: str,
        message: str,
        severity: str = "medium"
    ) -> dict:
        """
        Send alert notification
        
        Args:
            to_emails: List of recipient emails
            alert_type: Type of alert (security, sentiment, system)
            message: Alert message
            severity: low, medium, high, critical
        
        Returns:
            dict: Response with status
        """
        color_map = {
            "low": "#3B82F6",      # Blue
            "medium": "#F59E0B",   # Amber
            "high": "#EF4444",     # Red
            "critical": "#DC2626"  # Dark Red
        }
        
        subject = f"🚨 URADI-360 Alert: {alert_type.upper()} - {severity.upper()}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: {color_map.get(severity, '#F59E0B')}; color: white; padding: 20px; border-radius: 5px;">
                <h2 style="margin: 0;">🚨 {alert_type.upper()} Alert</h2>
                <p style="margin: 5px 0 0 0; font-size: 18px;">Severity: {severity.upper()}</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 5px;">
                <p style="font-size: 16px;">{message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://uradi360.vercel.app/alerts" 
                   style="background: #C8A94E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View in Dashboard
                </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
                URADI-360 Political Intelligence Platform
            </p>
        </body>
        </html>
        """
        
        return self.send_bulk_email(to_emails, subject, html_content, "text/html")


# Global instance
email_service = EmailService()
