from fastapi import APIRouter
from api.auth import router as auth_router
from api.chat import router as chat_router
from api.profile import router as profile_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(chat_router, prefix="/agent", tags=["agent"])
router.include_router(profile_router, prefix="/profile", tags=["profile"])
