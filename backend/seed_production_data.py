"""
Production Seed Data Script
Seeds Jigawa State data: LGAs, Wards, Polling Units, Admin User
"""

import uuid
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Base, Tenant, User, LGA, Ward, PollingUnit
from database import get_db
from auth.utils import hash_password

def seed_production_data():
    """Seed production data for Jigawa State"""
    
    print("=" * 60)
    print("URADI-360 PRODUCTION DATA SEEDING")
    print("=" * 60)
    
    # Create database session
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # 1. Create Tenant
        print("\n1. Creating Jigawa State tenant...")
        tenant = db.query(Tenant).filter(Tenant.id == "jigawa").first()
        if not tenant:
            tenant = Tenant(
                id="jigawa",
                display_name="Jigawa State",
                state="Jigawa",
                tier="state",
                candidate_name="Hon. Mustapha Sule Lamido",
                candidate_party="PDP",
                lga_count=27,
                config={
                    "election_year": 2027,
                    "election_type": "gubernatorial",
                    "total_polling_units": 5248,
                    "registered_voters_2023": 2345678
                },
                status="active"
            )
            db.add(tenant)
            db.commit()
            print("✓ Tenant created: Jigawa State")
        else:
            print("✓ Tenant already exists")
        
        # 2. Create Admin User
        print("\n2. Creating admin user...")
        admin = db.query(User).filter(User.email == "admin@jigawa2027.com").first()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                tenant_id="jigawa",
                email="admin@jigawa2027.com",
                full_name="System Administrator",
                phone="+2348000000000",
                role="admin",
                password_hash=hash_password("Admin123!"),
                active=True,
                created_at=datetime.utcnow()
            )
            db.add(admin)
            db.commit()
            print("✓ Admin user created")
            print("  Email: admin@jigawa2027.com")
            print("  Password: Admin123!")
        else:
            print("✓ Admin user already exists")
        
        # 3. Create LGAs
        print("\n3. Creating 27 LGAs...")
        lgas_data = [
            {"name": "Auyo", "code": "AU", "population": 152847},
            {"name": "Babura", "code": "BA", "population": 168234},
            {"name": "Birniwa", "code": "BI", "population": 142567},
            {"name": "Buji", "code": "BU", "population": 98765},
            {"name": "Dutse", "code": "DU", "population": 298456, "is_capital": True},
            {"name": "Gagarawa", "code": "GA", "population": 112345},
            {"name": "Garki", "code": "GK", "population": 187654},
            {"name": "Gumel", "code": "GU", "population": 156789},
            {"name": "Guri", "code": "GR", "population": 87654},
            {"name": "Gwaram", "code": "GW", "population": 234567},
            {"name": "Gwiwa", "code": "GI", "population": 76543},
            {"name": "Hadejia", "code": "HA", "population": 245678},
            {"name": "Jahun", "code": "JA", "population": 198765},
            {"name": "Kafin Hausa", "code": "KH", "population": 167890},
            {"name": "Kaugama", "code": "KA", "population": 134567},
            {"name": "Kazaure", "code": "KZ", "population": 212345},
            {"name": "Kiri Kasama", "code": "KK", "population": 98765},
            {"name": "Maigatari", "code": "MG", "population": 145678},
            {"name": "Malam Madori", "code": "MM", "population": 178901},
            {"name": "Miga", "code": "MI", "population": 87654},
            {"name": "Ringim", "code": "RI", "population": 201234},
            {"name": "Roni", "code": "RO", "population": 65432},
            {"name": "Sule Tankarkar", "code": "ST", "population": 156789},
            {"name": "Taura", "code": "TA", "population": 112345},
            {"name": "Yankwashi", "code": "YA", "population": 87654},
            {"name": "Birnin Kudu", "code": "BK", "population": 223456},
            {"name": "Kiyawa", "code": "KI", "population": 134567}
        ]
        
        lga_map = {}
        for lga_data in lgas_data:
            lga = db.query(LGA).filter(
                LGA.tenant_id == "jigawa",
                LGA.name == lga_data["name"]
            ).first()
            
            if not lga:
                lga = LGA(
                    id=uuid.uuid4(),
                    tenant_id="jigawa",
                    name=lga_data["name"],
                    code=lga_data["code"],
                    population=lga_data["population"],
                    geo_json={
                        "type": "Feature",
                        "properties": {
                            "name": lga_data["name"],
                            "is_capital": lga_data.get("is_capital", False)
                        },
                        "geometry": None  # Would be populated with actual GeoJSON
                    }
                )
                db.add(lga)
                db.commit()
                lga_map[lga_data["name"]] = lga
                print(f"  ✓ Created LGA: {lga_data['name']}")
            else:
                lga_map[lga_data["name"]] = lga
                print(f"  ✓ LGA exists: {lga_data['name']}")
        
        # 4. Create Sample Wards
        print("\n4. Creating sample wards...")
        ward_count = 0
        for lga_name, lga in lga_map.items():
            # Create 5-10 wards per LGA
            num_wards = 5 + (hash(lga_name) % 6)
            for i in range(1, num_wards + 1):
                ward_name = f"Ward {i}"
                ward = db.query(Ward).filter(
                    Ward.tenant_id == "jigawa",
                    Ward.lga_id == lga.id,
                    Ward.name == ward_name
                ).first()
                
                if not ward:
                    ward = Ward(
                        id=uuid.uuid4(),
                        tenant_id="jigawa",
                        lga_id=lga.id,
                        name=ward_name,
                        polling_units=10 + (i * 2),
                        registered_voters=5000 + (i * 500)
                    )
                    db.add(ward)
                    ward_count += 1
        
        db.commit()
        print(f"✓ Created {ward_count} wards")
        
        # 5. Create Sample Polling Units
        print("\n5. Creating sample polling units...")
        wards = db.query(Ward).filter(Ward.tenant_id == "jigawa").all()
        pu_count = 0
        
        for ward in wards[:50]:  # Create PUs for first 50 wards only (sample)
            num_pus = ward.polling_units or 10
            for i in range(1, min(num_pus + 1, 6)):  # Max 5 PUs per ward for sample
                pu_code = f"{ward.name.replace(' ', '')}-{i:03d}"
                
                pu = db.query(PollingUnit).filter(
                    PollingUnit.tenant_id == "jigawa",
                    PollingUnit.pu_code == pu_code
                ).first()
                
                if not pu:
                    pu = PollingUnit(
                        id=uuid.uuid4(),
                        tenant_id="jigawa",
                        lga_id=ward.lga_id,
                        ward_id=ward.id,
                        pu_code=pu_code,
                        pu_name=f"PU {i}",
                        registered_voters=500 + (i * 50),
                        latitude=None,  # Would be populated with actual coordinates
                        longitude=None,
                        status="active"
                    )
                    db.add(pu)
                    pu_count += 1
        
        db.commit()
        print(f"✓ Created {pu_count} polling units (sample)")
        
        # 6. Create Sample Voters
        print("\n6. Creating sample voters...")
        from models import Voter
        
        sample_voters = [
            {"name": "Ahmad Musa", "phone": "08012345678", "gender": "male", "age": "25-34", "occupation": "Trader"},
            {"name": "Fatima Ibrahim", "phone": "08023456789", "gender": "female", "age": "35-44", "occupation": "Teacher"},
            {"name": "Mohammed Sani", "phone": "08034567890", "gender": "male", "age": "45-54", "occupation": "Farmer"},
            {"name": "Aisha Abdullahi", "phone": "08045678901", "gender": "female", "age": "18-24", "occupation": "Student"},
            {"name": "Yusuf Garba", "phone": "08056789012", "gender": "male", "age": "35-44", "occupation": "Business"},
        ]
        
        voter_count = 0
        for voter_data in sample_voters:
            voter = db.query(Voter).filter(Voter.phone == voter_data["phone"]).first()
            if not voter:
                # Assign to random LGA
                lga = list(lga_map.values())[voter_count % len(lga_map)]
                
                voter = Voter(
                    id=uuid.uuid4(),
                    tenant_id="jigawa",
                    full_name=voter_data["name"],
                    phone=voter_data["phone"],
                    lga_id=lga.id,
                    gender=voter_data["gender"],
                    age_range=voter_data["age"],
                    occupation=voter_data["occupation"],
                    party_leaning="PDP" if voter_count % 3 == 0 else "Undecided",
                    sentiment_score=50 + (voter_count * 10),
                    persuadability=60 + (voter_count * 5),
                    source="seed",
                    created_at=datetime.utcnow()
                )
                db.add(voter)
                voter_count += 1
        
        db.commit()
        print(f"✓ Created {voter_count} sample voters")
        
        # Summary
        print("\n" + "=" * 60)
        print("SEEDING COMPLETE")
        print("=" * 60)
        print(f"\nSummary:")
        print(f"  - Tenant: Jigawa State")
        print(f"  - Admin User: admin@jigawa2027.com")
        print(f"  - LGAs: {len(lgas_data)}")
        print(f"  - Wards: {ward_count}")
        print(f"  - Polling Units: {pu_count} (sample)")
        print(f"  - Voters: {voter_count} (sample)")
        print(f"\nNext Steps:")
        print(f"  1. Login with admin credentials")
        print(f"  2. Create additional users")
        print(f"  3. Import full voter database")
        print(f"  4. Configure polling unit coordinates")
        print(f"  5. Deploy field app to agents")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_production_data()
