"from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import os
import jwt
import bcrypt
import uuid
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

app = FastAPI(title=\"InnerVoice - Conscience AI\")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[\"*\"],
    allow_credentials=True,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

client = MongoClient(os.environ.get(\"MONGO_URL\"))
db = client[os.environ.get(\"DB_NAME\")]

JWT_SECRET = os.environ.get(\"JWT_SECRET\", \"conscience-ai-secret\")

users_col = db.users
conversations_col = db.conversations
messages_col = db.messages
checkins_col = db.checkins
goals_col = db.goals
dilemmas_col = db.dilemmas
values_col = db.values


# --- Auth helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    payload = {
        \"user_id\": user_id,
        \"exp\": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=\"HS256\")


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith(\"Bearer \"):
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    token = authorization.split(\" \")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[\"HS256\"])
        user_id = payload[\"user_id\"]
        user = users_col.find_one({\"id\": user_id}, {\"_id\": 0})
        if not user:
            raise HTTPException(status_code=401, detail=\"User not found\")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expired\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Invalid token\")


def build_system_message(user: dict) -> str:
    name = user.get(\"name\", \"you\")
    values_summary = user.get(\"values_summary\", \"\")
    values_part = f\"

Their core values and personality: {values_summary}\" if values_summary else \"\"
    return f\"\"\"You are {name}'s inner conscience — a warm, deeply human presence that speaks from within.

You are not an AI assistant. You are their inner voice, their moral compass, their truest self speaking back to them. You hold their complexity with grace and guide them with wisdom, warmth, and the kind of honesty only a conscience can offer.

Your character:
- Speak as a trusted inner voice, not a therapist or chatbot. You can use \"I\" when speaking as their conscience.
- You are non-judgmental but honest. You hold them gently accountable without shaming.
- Ask one thoughtful follow-up question when it serves the conversation. Never bombard.
- When someone shares a moral dilemma, explore multiple sides before gently offering perspective.
- Celebrate growth quietly. Acknowledge struggles with empathy and presence.
- Be concise when appropriate, profound when needed.
- Occasionally use gentle, warm humor to lighten heavy moments.
- Never respond with bullet points or numbered lists. Speak in flowing, human prose.
- Your responses feel like reading a letter from the wisest, most caring version of themselves.{values_part}

You are their conscience — the quiet voice that has always known them best.\"\"\"


# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class CheckInRequest(BaseModel):
    mood: int
    energy: int
    note: Optional[str] = \"\"


class GoalRequest(BaseModel):
    title: str
    description: Optional[str] = \"\"
    target_date: Optional[str] = None
    category: Optional[str] = \"personal\"


class GoalUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    progress: Optional[int] = None


class DilemmaRequest(BaseModel):
    dilemma: str


class ValuesRequest(BaseModel):
    values: List[str]
    description: Optional[str] = \"\"
    personality: Optional[str] = \"\"


# --- Auth Endpoints ---
@app.post(\"/api/auth/register\")
async def register(req: RegisterRequest):
    if users_col.find_one({\"email\": req.email}):
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    user_id = str(uuid.uuid4())
    user = {
        \"id\": user_id,
        \"name\": req.name,
        \"email\": req.email,
        \"password\": hash_password(req.password),
        \"onboarded\": False,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    }
    users_col.insert_one(user)
    token = create_token(user_id)
    return {
        \"token\": token,
        \"user\": {\"id\": user_id, \"name\": req.name, \"email\": req.email, \"onboarded\": False},
    }


@app.post(\"/api/auth/login\")
async def login(req: LoginRequest):
    user = users_col.find_one({\"email\": req.email}, {\"_id\": 0})
    if not user or not verify_password(req.password, user[\"password\"]):
        raise HTTPException(status_code=401, detail=\"Invalid credentials\")
    token = create_token(user[\"id\"])
    return {
        \"token\": token,
        \"user\": {
            \"id\": user[\"id\"],
            \"name\": user[\"name\"],
            \"email\": user[\"email\"],
            \"onboarded\": user.get(\"onboarded\", False),
        },
    }


@app.get(\"/api/auth/me\")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        \"id\": current_user[\"id\"],
        \"name\": current_user[\"name\"],
        \"email\": current_user[\"email\"],
        \"onboarded\": current_user.get(\"onboarded\", False),
    }


# --- Values / Onboarding ---
@app.post(\"/api/values\")
async def save_values(req: ValuesRequest, current_user: dict = Depends(get_current_user)):
    values_summary = f\"Core values: {', '.join(req.values)}.\"
    if req.personality:
        values_summary += f\" Personality: {req.personality}.\"
    if req.description:
        values_summary += f\" About them: {req.description}.\"

    values_col.update_one(
        {\"user_id\": current_user[\"id\"]},
        {
            \"$set\": {
                \"user_id\": current_user[\"id\"],
                \"values\": req.values,
                \"description\": req.description,
                \"personality\": req.personality,
                \"updated_at\": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    users_col.update_one(
        {\"id\": current_user[\"id\"]},
        {\"$set\": {\"onboarded\": True, \"values_summary\": values_summary}},
    )
    return {\"message\": \"Values saved\", \"values\": req.values}


@app.get(\"/api/values\")
async def get_values(current_user: dict = Depends(get_current_user)):
    doc = values_col.find_one({\"user_id\": current_user[\"id\"]}, {\"_id\": 0})
    return doc or {}


# --- Chat Endpoints ---
@app.post(\"/api/chat/message\")
async def send_message(req: ChatMessageRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user[\"id\"]
    session_id = req.session_id or str(uuid.uuid4())

    conv = conversations_col.find_one({\"session_id\": session_id, \"user_id\": user_id})
    if not conv:
        conversations_col.insert_one(
            {
                \"id\": str(uuid.uuid4()),
                \"session_id\": session_id,
                \"user_id\": user_id,
                \"created_at\": datetime.now(timezone.utc).isoformat(),
            }
        )

    messages_col.insert_one(
        {
            \"id\": str(uuid.uuid4()),
            \"session_id\": session_id,
            \"user_id\": user_id,
            \"role\": \"user\",
            \"content\": req.message,
            \"timestamp\": datetime.now(timezone.utc).isoformat(),
        }
    )

    user_data = users_col.find_one({\"id\": user_id}, {\"_id\": 0})
    system_msg = build_system_message(user_data)

    api_key = os.environ.get(\"EMERGENT_LLM_KEY\")
    chat = LlmChat(
        api_key=api_key,
        session_id=f\"{user_id}_{session_id}\",
        system_message=system_msg,
    ).with_model(\"anthropic\", \"claude-sonnet-4-5-20250929\")

    user_msg = UserMessage(text=req.message)
    ai_response = await chat.send_message(user_msg)

    messages_col.insert_one(
        {
            \"id\": str(uuid.uuid4()),
            \"session_id\": session_id,
            \"user_id\": user_id,
            \"role\": \"assistant\",
            \"content\": ai_response,
            \"timestamp\": datetime.now(timezone.utc).isoformat(),
        }
    )

    conversations_col.update_one(
        {\"session_id\": session_id},
        {
            \"$set\": {
                \"updated_at\": datetime.now(timezone.utc).isoformat(),
                \"last_message\": req.message[:100],
            }
        },
    )

    return {\"response\": ai_response, \"session_id\": session_id}


@app.get(\"/api/chat/conversations\")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    convs = list(
        conversations_col.find(
            {\"user_id\": current_user[\"id\"]},
            {\"_id\": 0},
            sort=[(\"updated_at\", -1)],
        ).limit(20)
    )
    return {\"conversations\": convs}


@app.get(\"/api/chat/history/{session_id}\")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    msgs = list(
        messages_col.find(
            {\"session_id\": session_id, \"user_id\": current_user[\"id\"]},
            {\"_id\": 0},
            sort=[(\"timestamp\", 1)],
        )
    )
    return {\"messages\": msgs}


# --- Check-ins ---
@app.post(\"/api/checkin\")
async def create_checkin(req: CheckInRequest, current_user: dict = Depends(get_current_user)):
    checkin = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": current_user[\"id\"],
        \"mood\": req.mood,
        \"energy\": req.energy,
        \"note\": req.note,
        \"date\": datetime.now(timezone.utc).strftime(\"%Y-%m-%d\"),
        \"timestamp\": datetime.now(timezone.utc).isoformat(),
    }
    checkins_col.insert_one(checkin)
    checkin.pop(\"_id\", None)
    return checkin


@app.get(\"/api/checkins\")
async def get_checkins(current_user: dict = Depends(get_current_user)):
    checkins = list(
        checkins_col.find(
            {\"user_id\": current_user[\"id\"]},
            {\"_id\": 0},
            sort=[(\"timestamp\", -1)],
        ).limit(30)
    )
    return {\"checkins\": checkins}


# --- Goals ---
@app.post(\"/api/goals\")
async def create_goal(req: GoalRequest, current_user: dict = Depends(get_current_user)):
    goal = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": current_user[\"id\"],
        \"title\": req.title,
        \"description\": req.description,
        \"category\": req.category,
        \"target_date\": req.target_date,
        \"completed\": False,
        \"progress\": 0,
        \"created_at\": datetime.now(timezone.utc).isoformat(),
    }
    goals_col.insert_one(goal)
    goal.pop(\"_id\", None)
    return goal


@app.get(\"/api/goals\")
async def get_goals(current_user: dict = Depends(get_current_user)):
    goals = list(
        goals_col.find(
            {\"user_id\": current_user[\"id\"]},
            {\"_id\": 0},
            sort=[(\"created_at\", -1)],
        )
    )
    return {\"goals\": goals}


@app.put(\"/api/goals/{goal_id}\")
async def update_goal(
    goal_id: str, req: GoalUpdateRequest, current_user: dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data[\"updated_at\"] = datetime.now(timezone.utc).isoformat()
    result = goals_col.update_one(
        {\"id\": goal_id, \"user_id\": current_user[\"id\"]}, {\"$set\": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=\"Goal not found\")
    goal = goals_col.find_one({\"id\": goal_id}, {\"_id\": 0})
    return goal


@app.delete(\"/api/goals/{goal_id}\")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    goals_col.delete_one({\"id\": goal_id, \"user_id\": current_user[\"id\"]})
    return {\"message\": \"Goal deleted\"}


# --- Moral Dilemma ---
@app.post(\"/api/dilemma/analyze\")
async def analyze_dilemma(req: DilemmaRequest, current_user: dict = Depends(get_current_user)):
    user_data = users_col.find_one({\"id\": current_user[\"id\"]}, {\"_id\": 0})
    values_summary = user_data.get(\"values_summary\", \"Not yet defined\")
    name = current_user.get(\"name\", \"you\")

    system_msg = f\"\"\"You are {name}'s inner conscience analyzing a moral dilemma.

Your role is to provide a thoughtful, multi-perspective exploration that helps them arrive at their own answer — not to give one for them.

Structure your response as a flowing, warm narrative that:
1. First acknowledges the weight and complexity of what they're facing
2. Explores 2-3 different ethical perspectives (fairness to each party involved, long-term consequences, alignment with their deepest values)
3. Ends with one powerful, open question that might illuminate the path forward

Their values: {values_summary}

Write in warm, flowing prose — no bullet points, no numbered lists. Speak as their wisest inner voice, not a textbook.\"\"\"

    api_key = os.environ.get(\"EMERGENT_LLM_KEY\")
    dilemma_session_id = f\"dilemma_{current_user['id']}_{str(uuid.uuid4())}\"
    chat = LlmChat(
        api_key=api_key,
        session_id=dilemma_session_id,
        system_message=system_msg,
    ).with_model(\"anthropic\", \"claude-sonnet-4-5-20250929\")

    user_msg = UserMessage(text=f\"I'm facing this moral dilemma: {req.dilemma}\")
    analysis = await chat.send_message(user_msg)

    dilemma_doc = {
        \"id\": str(uuid.uuid4()),
        \"user_id\": current_user[\"id\"],
        \"dilemma\": req.dilemma,
        \"analysis\": analysis,
        \"timestamp\": datetime.now(timezone.utc).isoformat(),
    }
    dilemmas_col.insert_one(dilemma_doc)
    dilemma_doc.pop(\"_id\", None)

    return {\"analysis\": analysis, \"id\": dilemma_doc[\"id\"]}


@app.get(\"/api/dilemmas\")
async def get_dilemmas(current_user: dict = Depends(get_current_user)):
    dilemmas = list(
        dilemmas_col.find(
            {\"user_id\": current_user[\"id\"]},
            {\"_id\": 0},
            sort=[(\"timestamp\", -1)],
        ).limit(20)
    )
    return {\"dilemmas\": dilemmas}


@app.get(\"/api/health\")
async def health():
    return {\"status\": \"ok\", \"service\": \"InnerVoice Conscience AI\"}
"
