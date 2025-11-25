import { apiFetch } from "../api/client";

export async function uploadToGcs(file: File, token: string) {
  const signed = await apiFetch<{
    upload_url: string;
    public_url: string;
  }>("/attachments/signed-url", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
    }),
    token,
  });

  await fetch(signed.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  return signed.public_url;
}


