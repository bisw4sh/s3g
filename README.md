# s3g - managed gallery ontop of s3

#### This project is for learning purposes of uploading to the amazon s3 bucket.

1. [-] Authentication with betterAuth in my neon postgresql db using drizzle.

2. [] TailwindCSS will be custom color where i will modify using color palette, no dark modes using[tweakcn](https://tweakcn.com/). 

3. [] framer-motion for animate presence.

4. [] authenticated means you're eligible for up/down votes, admin who can upload and delete, and unauthenticated can only see on what is available.

5. [] infinite query using react-query.

```
### Things to configure in AWS S3.

- IAM user should have s3 permission.
- Bucket policy, presignedUrls(GET, POST), CORS(this is pesky when trying with browser)
