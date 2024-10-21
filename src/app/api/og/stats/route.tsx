import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  if (!username) {
    return new ImageResponse(<>Visit with &quot;?username=vercel&quot;</>, {
      width: 1200,
      height: 630,
    });
  }

  return new ImageResponse(
    (
      <>
        <div
          style={{
            position: "relative",
            width: "1200px",
            height: "630px",
            overflow: "hidden",
          }}
        >
          <img
            src="https://onthepixel.net/bg.png"
            style={{
              objectFit: "cover",
              position: "absolute",
              width: "1200px",
              height: "100%",
              top: 0,
              left: 0,
            }}
          />
          <div
            style={{
              overflow: "hidden",
              position: "relative",
              marginTop: "1rem",
              marginBottom: "1rem",
              marginLeft: "1rem",
              borderRadius: "0.5rem",
              width: "10rem",
              height: "10rem",
              backgroundColor: "#6B7280",
              display: "flex",
            }}
          >
            <img
              style={{
                position: "absolute",
                right: 0,
                left: 0,
                backgroundColor: "#6B7280",
              }}
              width="200"
              src={`https://vzge.me/full/200/${username}.png`}
            />
          </div>
          <p style={{ position: "relative" }}>{username}</p>
        </div>
      </>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
