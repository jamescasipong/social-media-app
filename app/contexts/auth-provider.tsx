import { cookies } from "next/headers";
import { AuthProvider } from "./AuthContext";

async function getUser() {
  const token = (await cookies()).get("authToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      "https://socmedia-api.vercel.app/api/auth/profile",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function customFetch(url: string, method: any, init: any) {
  const token = (await cookies()).get("authToken")?.value;
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(init),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  return response;
}

export default async function ServerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
