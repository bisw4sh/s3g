# s3g - managed gallery ontop of s3

#### This project is for learning purposes of uploading to the amazon s3 bucket.

1. Authentication with betterAuth, using neon's serverless postgresql with drizzle.

2. TailwindCSS : modified using color palette and tweaked using [tweakcn](https://tweakcn.com/) and most importantly no DARK MODE.

3. Roles
- unauthenticated :  can only see on what is available(photo and likes).
- authenticated(user) : means you're eligible for liking, uploading, deleting own images.
- admin : can do everything that a user can and can ban, change roles of user, impersonate, delete user, delete other's images.

4. infinite query using react-query.

5. notification and web push notification using firebase's FCM.

```
Things to configure in AWS S3.

- IAM user should have s3 permission.
- Bucket policy, presignedUrls(GET, POST), CORS(this is pesky when trying with browser)
