# Trivi Project Documentation

## 1. Project Idea
**Trivi** (or TriviAI) is an engaging, gamified quiz application built with React Native. It is designed to test users' knowledge across various domains through different question formats while providing a rewarding leveling system. The core concept revolves around making learning fun with a colorful, modern interface and AI-powered question generation.

## 2. Main Features
*   **Authentication System**:
    *   Secure User Signup and Login.
    *   Session management.
*   **Diverse Quiz Types**:
    *   **MCQ**: Standard multiple-choice questions.
    *   **True/False**: Quick binary choice questions.
    *   **Programming**: Code-snippet based challenges.
    *   **Riddle**: Brain teasers and logic puzzles.
*   **Gamification**:
    *   **XP System**: Users earn 10 XP per correct answer.
    *   **Leveling**: Progressive leveling system (100 XP per level, up to level 10).
    *   **Progress Tracking**: Visual progress bars showing journey to the next level.
*   **Leaderboard**:
    *   Displays top users based on accumulated XP.
*   **User Profile**:
    *   Personalized dashboard showing stats, current level, and total XP.
*   **Modern UI/UX**:
    *   Vibrant, gradient-rich design (Indigo/Pink/Purple theme).
    *   Interactive elements with animations and haptic feedback.

## 3. Database Used and Functionality
The application utilizes a **local-first** database strategy to ensure meaningful offline capability and fast performance.

*   **Database Engine**:
    *   **Mobile**: `expo-sqlite` (SQLite) is used for robust, relational data storage on Android and iOS.
    *   **Web**: `localforage` is used as a fallback for web compatibility.
*   **Database Schema**:
    *   **Users Table**: Stores `id`, `username`, `email`, `password` (hashed), and `xp`.
*   **Functionality**:
    *   **Persistence**: User progress (XP, Levels) and credentials are persisted locally.
    *   **Initialization**: The database auto-initializes on app start, creating necessary tables if they don't exist.
    *   **Data Integrity**: Used for reliable storage of user stats and authentication data.

## 4. Unique Feature Description
**AI-Powered Content Generation via OpenRouter**
The standout feature of Trivi is its integration with the **OpenRouter.ai API**. Unlike traditional quiz apps with static databases of questions, Trivi leverages LLMs (Large Language Models) to generate dynamic, infinite, and varied content.
*   **Dynamic Generation**: Questions are not hardcoded; they can be generated on-the-fly, ensuring 4 distinct types (MCQ, Boolean, Code, Riddle) are always fresh.
*   **Adaptive Difficulty**: The system logic supports varying difficulty levels (Easy, Medium, Hard, Very Hard).
*   **Smart Parsing**: The app intelligently parses AI responses into structured JSON for the game engine.

## 5. Screenshots
> *Placeholders for project screenshots. Replace with actual captures from the Application.*

### Authentication
| Login Screen | Signup Screen |
|:---:|:---:|
| *(Insert Login Screenshot)* | *(Insert Signup Screenshot)* |

### Core Gameplay
| Home Dashboard | Quiz Interface (MCQ) |
|:---:|:---:|
| *(Insert Home Screenshot)* | *(Insert Quiz Screenshot)* |

### Progression
| Profile & Stats | Leaderboard |
|:---:|:---:|
| *(Insert Profile Screenshot)* | *(Insert Leaderboard Screenshot)* |
