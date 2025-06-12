This project is for learning purposes of uploading to the amazon s3 bucket.

[-] Authentication with betterAuth in my postgresql db using drizzle.

[-] TailwindCSS will be custom color where i will modify using color palette, no dark modes. 

[-] framer-motion for animate presence.

[-] no roles, authenticated means admin who can upload and delete, and unauthenticated can only see on what is available.

[-] infinite query using react-query.

### Run PostgreSQL on Docker

```
mkdir -p ~/docker-volumes/postgres-data  # Create the directory if it doesn't exist
```

```docker
docker run --name db \
  -e POSTGRES_USER=bisw4sh \
  -e POSTGRES_PASSWORD=acernitro \
  -e POSTGRES_DB=s3gallery \
  -p 5432:5432 \
  -v ~/docker-volumes/postgres-data:/var/lib/postgresql/data \
  -d postgres
```

#### Accessing the postgres data in the volume:
`docker exec -it db psql -U bisw4sh -d s3gallery`

### Things to configure in AWS S3.

- IAM user should have s3 permission.
- Bucket policy, presignedUrls(GET, POST), CORS(this is pesky when trying with browser)
