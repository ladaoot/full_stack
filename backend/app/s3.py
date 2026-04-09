import os
import aioboto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "articles")
S3_PUBLIC_URL = os.getenv("S3_PUBLIC_URL", f"{S3_ENDPOINT_URL}/{S3_BUCKET_NAME}")

session = aioboto3.Session()

class S3Service:
    def __init__(self):
        self.endpoint_url = S3_ENDPOINT_URL
        self.access_key = S3_ACCESS_KEY
        self.secret_key = S3_SECRET_KEY
        self.bucket_name = S3_BUCKET_NAME

    async def _get_client(self):
        return session.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="us-east-1",  # MinIO requires a region
        )

    async def ensure_bucket_exists(self):
        async with await self._get_client() as s3:
            try:
                await s3.head_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                if error_code == "404":
                    await s3.create_bucket(Bucket=self.bucket_name)
                    # Set public read policy for the bucket in MinIO
                    import json
                    policy = {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {"AWS": ["*"]},
                                "Action": ["s3:GetObject"],
                                "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                            }
                        ]
                    }
                    await s3.put_bucket_policy(Bucket=self.bucket_name, Policy=json.dumps(policy))
                else:
                    raise e

    async def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        async with await self._get_client() as s3:
            await s3.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=file_content,
                ContentType=content_type
            )
            return f"{S3_PUBLIC_URL}/{filename}"

    async def delete_file(self, filename: str):
        async with await self._get_client() as s3:
            try:
                await s3.delete_object(Bucket=self.bucket_name, Key=filename)
            except ClientError:
                pass

    async def get_file(self, filename: str) -> bytes:
        async with await self._get_client() as s3:
            response = await s3.get_object(Bucket=self.bucket_name, Key=filename)
            return await response["Body"].read()

s3_service = S3Service()
