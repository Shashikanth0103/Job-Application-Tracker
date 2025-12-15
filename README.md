# Job Application Tracker

A simple webpage to keep track of your job applications. It saves your job details, lets you update them, and even helps you improve your resume with ATS recommendations.

---

## What it does

- Add new job applications
- Edit existing job details
- Delete job entries you don't want anymore
- Upload your resume
- Extract text from the resume using AWS Lambda
- Check your ATS score
- Show recommendations on how to improve your resume based on the ATS results

So you don’t just store jobs. You actually get feedback to make your chances better.

---

## Buttons on the Home Page

- **Add Application** – add a job record
- **View Applications** – see all jobs in a table
  - From here, you can **Edit** or **Delete** jobs
- **Upload Resume** – upload and store your resume
- **ATS Score** – checks your resume and gives suggestions

---

## Tech Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend (AWS)
- **API Gateway** – handles requests from the UI
- **AWS Lambda** – does all the real work
  - Stores job application details
  - Extracts text from the resume
  - Calculates ATS score
  - Gives improvement suggestions
- **DynamoDB** – stores job application data
- **S3** – stores uploaded resumes

No servers, no manual setup. Everything runs automatically through Lambda.

---

## How to use it

1. Open the live link of the project (no need to download anything).
2. Use the **Add Application** button to enter job details.
3. Go to **View Applications** to see everything you've added.
   - You can **Edit** or **Delete** jobs directly from here.
4. Upload your resume using the **Upload Resume** option.
5. Click **ATS Score** to check your score and see suggestions to improve your resume.

## Architecture

1. Frontend communicates with backend via REST APIs
2. API Gateway triggers AWS Lambda functions
3. Lambda handles business logic and stores data in DynamoDB
4. Resume files are uploaded and stored in Amazon S3

## Future Enhancements

1. User authentication and login for multiple users
2. AWS SNS integration for application status notifications
3. Improved interactivity in the frontend UI

![how web page looks](https://github.com/Shashikanth0103/Job-Application-Tracker/blob/main/Images/webpage.png)

