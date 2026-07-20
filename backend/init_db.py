from db.database import engine, Base
from db.models import User, UserProfile, ChatSession

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
