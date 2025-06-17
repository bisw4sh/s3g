This project is for learning purposes of uploading to the amazon s3 bucket.

[-] Authentication with betterAuth in my neon postgresql db using drizzle.

[-] TailwindCSS will be custom color where i will modify using color palette, no dark modes. 

[-] framer-motion for animate presence.

[-] no roles, authenticated means admin who can upload and delete, and unauthenticated can only see on what is available.

[-] infinite query using react-query.

```
#### Accessing the postgres data in the volume:
`docker exec -it db psql -U bisw4sh -d s3gallery`

### Things to configure in AWS S3.

- IAM user should have s3 permission.
- Bucket policy, presignedUrls(GET, POST), CORS(this is pesky when trying with browser)
