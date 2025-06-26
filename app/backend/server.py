{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1033{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\*\generator Riched20 10.0.22621}\viewkind4\uc1 
\pard\sa200\sl276\slmult1\f0\fs22\lang9 from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form\par
from fastapi.middleware.cors import CORSMiddleware\par
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials\par
from fastapi.encoders import jsonable_encoder\par
from pydantic import BaseModel, Field\par
from typing import List, Optional, Dict, Any\par
import os\par
import pymongo\par
from pymongo import MongoClient\par
from bson import ObjectId\par
import uuid\par
from datetime import datetime, timezone\par
import json\par
import openai\par
from enum import Enum\par
import base64\par
\par
# Initialize FastAPI app\par
app = FastAPI(title="ProjectConnect API", version="1.0.0")\par
\par
# CORS middleware\par
app.add_middleware(\par
    CORSMiddleware,\par
    allow_origins=["*"],\par
    allow_credentials=True,\par
    allow_methods=["*"],\par
    allow_headers=["*"],\par
)\par
\par
# Database setup\par
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')\par
client = MongoClient(MONGO_URL)\par
db = client.projectconnect\par
\par
# Collections\par
users_collection = db.users\par
projects_collection = db.projects\par
submissions_collection = db.submissions\par
reviews_collection = db.reviews\par
\par
# OpenAI setup\par
openai_api_key = os.environ.get('OPENAI_API_KEY', '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')\par
openai.api_key = openai_api_key\par
\par
# Helper function to convert MongoDB documents to JSON-safe format\par
def mongo_to_dict(doc):\par
    if doc is None:\par
        return None\par
    if isinstance(doc, list):\par
        return [mongo_to_dict(item) for item in doc]\par
    if isinstance(doc, dict):\par
        result = \{\}\par
        for key, value in doc.items():\par
            if key == '_id' and isinstance(value, ObjectId):\par
                continue  # Skip MongoDB _id field\par
            elif isinstance(value, ObjectId):\par
                result[key] = str(value)\par
            elif isinstance(value, dict):\par
                result[key] = mongo_to_dict(value)\par
            elif isinstance(value, list):\par
                result[key] = mongo_to_dict(value)\par
            else:\par
                result[key] = value\par
        return result\par
    return doc\par
\par
# Security\par
security = HTTPBearer(auto_error=False)\par
\par
# Enums\par
class UserType(str, Enum):\par
    STUDENT = "student"\par
    COMPANY = "company"\par
\par
class ProjectStatus(str, Enum):\par
    ACTIVE = "active"\par
    COMPLETED = "completed"\par
    CANCELLED = "cancelled"\par
\par
class SubmissionStatus(str, Enum):\par
    SUBMITTED = "submitted"\par
    UNDER_REVIEW = "under_review"\par
    REVIEWED = "reviewed"\par
    SELECTED = "selected"\par
\par
# Pydantic models\par
class User(BaseModel):\par
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))\par
    email: str\par
    name: str\par
    user_type: UserType\par
    bio: Optional[str] = ""\par
    skills: List[str] = []\par
    company_name: Optional[str] = None\par
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))\par
\par
class Project(BaseModel):\par
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))\par
    company_id: str\par
    title: str\par
    description: str\par
    domain: str\par
    requirements: List[str]\par
    deliverables: List[str]\par
    deadline: datetime\par
    payment_amount: Optional[float] = 0\par
    certificate_offered: bool = True\par
    status: ProjectStatus = ProjectStatus.ACTIVE\par
    max_submissions: int = 50\par
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))\par
\par
class Submission(BaseModel):\par
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))\par
    project_id: str\par
    student_id: str\par
    submission_text: str\par
    github_link: Optional[str] = None\par
    demo_link: Optional[str] = None\par
    additional_files: List[str] = []\par
    status: SubmissionStatus = SubmissionStatus.SUBMITTED\par
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))\par
\par
class AIReview(BaseModel):\par
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))\par
    submission_id: str\par
    project_id: str\par
    student_id: str\par
    overall_score: float\par
    technical_quality: float\par
    creativity: float\par
    completeness: float\par
    presentation: float\par
    detailed_feedback: str\par
    strengths: List[str]\par
    improvements: List[str]\par
    rank: Optional[int] = None\par
    reviewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))\par
\par
# API Routes\par
\par
@app.get("/api/health")\par
async def health_check():\par
    return \{"status": "healthy", "message": "ProjectConnect API is running"\}\par
\par
# User Management\par
@app.post("/api/users/register")\par
async def register_user(user: User):\par
    try:\par
        # Check if user already exists\par
        existing_user = users_collection.find_one(\{"email": user.email\})\par
        if existing_user:\par
            raise HTTPException(status_code=400, detail="User already exists")\par
        \par
        user_dict = user.dict()\par
        users_collection.insert_one(user_dict)\par
        \par
        # Convert to JSON-safe format\par
        user_safe = mongo_to_dict(user_dict)\par
        return \{"message": "User registered successfully", "user": user_safe\}\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/users/\{user_id\}")\par
async def get_user(user_id: str):\par
    try:\par
        user = users_collection.find_one(\{"id": user_id\})\par
        if not user:\par
            raise HTTPException(status_code=404, detail="User not found")\par
        return mongo_to_dict(user)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/users")\par
async def get_all_users():\par
    try:\par
        users = list(users_collection.find(\{\}))\par
        return mongo_to_dict(users)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
# Project Management\par
@app.post("/api/projects")\par
async def create_project(project: Project):\par
    try:\par
        project_dict = project.dict()\par
        projects_collection.insert_one(project_dict)\par
        return \{"message": "Project created successfully", "project": mongo_to_dict(project_dict)\}\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/projects")\par
async def get_all_projects():\par
    try:\par
        projects = list(projects_collection.find(\{"status": "active"\}))\par
        return mongo_to_dict(projects)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/projects/\{project_id\}")\par
async def get_project(project_id: str):\par
    try:\par
        project = projects_collection.find_one(\{"id": project_id\})\par
        if not project:\par
            raise HTTPException(status_code=404, detail="Project not found")\par
        return mongo_to_dict(project)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/projects/company/\{company_id\}")\par
async def get_company_projects(company_id: str):\par
    try:\par
        projects = list(projects_collection.find(\{"company_id": company_id\}))\par
        return mongo_to_dict(projects)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
# Submission Management\par
@app.post("/api/submissions")\par
async def create_submission(submission: Submission):\par
    try:\par
        # Check if project exists and is active\par
        project = projects_collection.find_one(\{"id": submission.project_id, "status": "active"\})\par
        if not project:\par
            raise HTTPException(status_code=404, detail="Active project not found")\par
        \par
        # Check if student already submitted for this project\par
        existing_submission = submissions_collection.find_one(\{\par
            "project_id": submission.project_id,\par
            "student_id": submission.student_id\par
        \})\par
        if existing_submission:\par
            raise HTTPException(status_code=400, detail="You have already submitted for this project")\par
        \par
        submission_dict = submission.dict()\par
        submissions_collection.insert_one(submission_dict)\par
        \par
        # Trigger AI review\par
        await trigger_ai_review(submission_dict)\par
        \par
        return \{"message": "Submission created successfully", "submission": mongo_to_dict(submission_dict)\}\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/submissions/project/\{project_id\}")\par
async def get_project_submissions(project_id: str):\par
    try:\par
        submissions = list(submissions_collection.find(\{"project_id": project_id\}))\par
        return mongo_to_dict(submissions)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/submissions/student/\{student_id\}")\par
async def get_student_submissions(student_id: str):\par
    try:\par
        submissions = list(submissions_collection.find(\{"student_id": student_id\}))\par
        return mongo_to_dict(submissions)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
# AI Review System\par
async def trigger_ai_review(submission_dict: dict):\par
    try:\par
        # Get project details\par
        project = projects_collection.find_one(\{"id": submission_dict["project_id"]\})\par
        if not project:\par
            return\par
        \par
        # Get student details\par
        student = users_collection.find_one(\{"id": submission_dict["student_id"]\})\par
        if not student:\par
            return\par
        \par
        # Prepare AI prompt\par
        prompt = f"""\par
        You are an AI reviewer evaluating a student's project submission. Please provide a comprehensive review.\par
\par
        PROJECT DETAILS:\par
        Title: \{project.get('title', '')\}\par
        Domain: \{project.get('domain', '')\}\par
        Description: \{project.get('description', '')\}\par
        Requirements: \{', '.join(project.get('requirements', []))\}\par
        Deliverables: \{', '.join(project.get('deliverables', []))\}\par
\par
        STUDENT SUBMISSION:\par
        Submission Text: \{submission_dict.get('submission_text', '')\}\par
        GitHub Link: \{submission_dict.get('github_link', 'Not provided')\}\par
        Demo Link: \{submission_dict.get('demo_link', 'Not provided')\}\par
\par
        EVALUATION CRITERIA:\par
        Please evaluate on a scale of 0-100 for each category:\par
        1. Technical Quality (0-100): Code quality, functionality, best practices\par
        2. Creativity (0-100): Innovation, unique approach, creative solutions  \par
        3. Completeness (0-100): Meeting requirements, delivering all asked features\par
        4. Presentation (0-100): Documentation, explanation, clarity\par
\par
        Please respond in the following JSON format:\par
        \{\{\par
            "overall_score": [0-100],\par
            "technical_quality": [0-100],\par
            "creativity": [0-100], \par
            "completeness": [0-100],\par
            "presentation": [0-100],\par
            "detailed_feedback": "Detailed paragraph explaining the evaluation",\par
            "strengths": ["strength1", "strength2", "strength3"],\par
            "improvements": ["improvement1", "improvement2", "improvement3"]\par
        \}\}\par
        """\par
        \par
        # Call OpenAI API\par
        response = openai.chat.completions.create(\par
            model="gpt-4",\par
            messages=[\par
                \{"role": "system", "content": "You are an expert project reviewer. Provide fair, constructive, and detailed feedback."\},\par
                \{"role": "user", "content": prompt\}\par
            ],\par
            temperature=0.3,\par
            max_tokens=1500\par
        )\par
        \par
        # Parse AI response\par
        ai_feedback = json.loads(response.choices[0].message.content)\par
        \par
        # Create review record\par
        review = AIReview(\par
            submission_id=submission_dict["id"],\par
            project_id=submission_dict["project_id"],\par
            student_id=submission_dict["student_id"],\par
            overall_score=ai_feedback["overall_score"],\par
            technical_quality=ai_feedback["technical_quality"],\par
            creativity=ai_feedback["creativity"],\par
            completeness=ai_feedback["completeness"],\par
            presentation=ai_feedback["presentation"],\par
            detailed_feedback=ai_feedback["detailed_feedback"],\par
            strengths=ai_feedback["strengths"],\par
            improvements=ai_feedback["improvements"]\par
        )\par
        \par
        # Save review\par
        review_dict = review.dict()\par
        reviews_collection.insert_one(review_dict)\par
        \par
        # Update submission status\par
        submissions_collection.update_one(\par
            \{"id": submission_dict["id"]\},\par
            \{"$set": \{"status": "reviewed"\}\}\par
        )\par
        \par
        # Update rankings for this project\par
        await update_project_rankings(submission_dict["project_id"])\par
        \par
    except Exception as e:\par
        print(f"AI Review Error: \{str(e)\}")\par
\par
async def update_project_rankings(project_id: str):\par
    try:\par
        # Get all reviews for this project\par
        reviews = list(reviews_collection.find(\{"project_id": project_id\}))\par
        \par
        # Sort by overall score (descending)\par
        reviews.sort(key=lambda x: x["overall_score"], reverse=True)\par
        \par
        # Update ranks\par
        for i, review in enumerate(reviews):\par
            reviews_collection.update_one(\par
                \{"id": review["id"]\},\par
                \{"$set": \{"rank": i + 1\}\}\par
            )\par
            \par
    except Exception as e:\par
        print(f"Ranking Error: \{str(e)\}")\par
\par
@app.get("/api/reviews/project/\{project_id\}")\par
async def get_project_reviews(project_id: str):\par
    try:\par
        reviews = list(reviews_collection.find(\{"project_id": project_id\}))\par
        reviews_safe = mongo_to_dict(reviews)\par
        \par
        # Sort by rank\par
        if reviews_safe:\par
            reviews_safe.sort(key=lambda x: x.get("rank", 999))\par
        return reviews_safe\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/reviews/student/\{student_id\}")\par
async def get_student_reviews(student_id: str):\par
    try:\par
        reviews = list(reviews_collection.find(\{"student_id": student_id\}))\par
        return mongo_to_dict(reviews)\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
@app.get("/api/leaderboard/\{project_id\}")\par
async def get_project_leaderboard(project_id: str):\par
    try:\par
        # Get project reviews with student info\par
        pipeline = [\par
            \{"$match": \{"project_id": project_id\}\},\par
            \{"$lookup": \{\par
                "from": "users",\par
                "localField": "student_id", \par
                "foreignField": "id",\par
                "as": "student_info"\par
            \}\},\par
            \{"$sort": \{"rank": 1\}\}\par
        ]\par
        \par
        leaderboard = list(reviews_collection.aggregate(pipeline))\par
        leaderboard_safe = mongo_to_dict(leaderboard)\par
        \par
        # Process student info\par
        for entry in leaderboard_safe:\par
            if entry.get('student_info') and len(entry['student_info']) > 0:\par
                entry['student_info'] = entry['student_info'][0]\par
        \par
        return leaderboard_safe\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
# Certificate endpoint\par
@app.post("/api/certificates/issue/\{student_id\}/\{project_id\}")\par
async def issue_certificate(student_id: str, project_id: str):\par
    try:\par
        # Get project and student info\par
        project = projects_collection.find_one(\{"id": project_id\})\par
        student = users_collection.find_one(\{"id": student_id\})\par
        review = reviews_collection.find_one(\{"student_id": student_id, "project_id": project_id\})\par
        \par
        if not all([project, student, review]):\par
            raise HTTPException(status_code=404, detail="Required data not found")\par
        \par
        certificate_data = \{\par
            "id": str(uuid.uuid4()),\par
            "student_name": student["name"],\par
            "project_title": project["title"],\par
            "company_name": project.get("company_name", "Unknown Company"),\par
            "domain": project["domain"],\par
            "score": review["overall_score"],\par
            "rank": review.get("rank", "N/A"),\par
            "issued_at": datetime.now(timezone.utc).isoformat()\par
        \}\par
        \par
        return \{"message": "Certificate issued successfully", "certificate": certificate_data\}\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
# Dashboard stats\par
@app.get("/api/stats/dashboard")\par
async def get_dashboard_stats():\par
    try:\par
        total_projects = projects_collection.count_documents(\{\})\par
        active_projects = projects_collection.count_documents(\{"status": "active"\})\par
        total_students = users_collection.count_documents(\{"user_type": "student"\})\par
        total_companies = users_collection.count_documents(\{"user_type": "company"\})\par
        total_submissions = submissions_collection.count_documents(\{\})\par
        \par
        return \{\par
            "total_projects": total_projects,\par
            "active_projects": active_projects,\par
            "total_students": total_students,\par
            "total_companies": total_companies,\par
            "total_submissions": total_submissions\par
        \}\par
    except Exception as e:\par
        raise HTTPException(status_code=500, detail=str(e))\par
\par
if __name__ == "__main__":\par
    import uvicorn\par
    uvicorn.run(app, host="0.0.0.0", port=8001)\par
}
 