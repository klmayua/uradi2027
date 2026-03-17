import os
import sys
import uuid
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from database import DATABASE_URL
from models import Tenant, LGA, User
from auth.utils import hash_password

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    """Seed the database with initial data for Jigawa tenant"""
    db = SessionLocal()
    
    try:
        # Check if tenant already exists
        existing_tenant = db.query(Tenant).filter(Tenant.id == "jigawa_lamido_2027").first()
        if existing_tenant:
            print("Jigawa tenant already exists")
        else:
            # Create Jigawa tenant
            jigawa_tenant = Tenant(
                id="jigawa_lamido_2027",
                display_name="Lamido Campaign - Jigawa",
                state="Jigawa",
                tier="governor",
                candidate_name="Hon. Mustapha Sule Lamido",
                candidate_party="APC",
                lga_count=27,
                config={},
                status="active"
            )
            
            db.add(jigawa_tenant)
            db.commit()
            print("Created Jigawa tenant")
        
        # List of LGAs in Jigawa State
        jigawa_lgas = [
            "Babura", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel",
            "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", 
            "Kiri Kasamma", "Kiyawa", "Maigatari", "Malam Maduri", "Miga", 
            "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi", 
            "Jigawa", "Kafin Kauri", "Kazurawa", "Machina"
        ]
        
        # Get the tenant
        tenant = db.query(Tenant).filter(Tenant.id == "jigawa_lamido_2027").first()
        
        # Create LGAs for Jigawa tenant if they don't exist
        existing_lgas = db.query(LGA).filter(LGA.tenant_id == "jigawa_lamido_2027").count()
        if existing_lgas == 0:
            for lga_name in jigawa_lgas:
                lga = LGA(
                    id=uuid.uuid4(),
                    tenant_id="jigawa_lamido_2027",
                    name=lga_name,
                    code=lga_name.lower().replace(" ", "_"),
                    population=0,  # Will be updated with real data later
                    geo_json={}    # Will be updated with real data later
                )
                db.add(lga)
            
            db.commit()
            print(f"Created {len(jigawa_lgas)} LGAs for Jigawa tenant")
        else:
            print("LGAs already exist for Jigawa tenant")
        
        # Create admin user if it doesn't exist
        admin_user = db.query(User).filter(User.email == "admin@uradi360.com").first()
        if not admin_user:
            admin_user = User(
                id=uuid.uuid4(),
                tenant_id="jigawa_lamido_2027",
                email="admin@uradi360.com",
                full_name="System Administrator",
                phone="+2348012345678",
                role="admin",
                password_hash=hash_password("AdminPass123!"),
                assigned_lga=None,
                active=True
            )
            db.add(admin_user)
            db.commit()
            print("Created admin user")
        else:
            print("Admin user already exists")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()