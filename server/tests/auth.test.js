import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";

describe("POST /api/auth/register", () => {
  it("should register a new user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@test.com");

    const user = await User.findOne({ email: "test@test.com" });
    expect(user).toBeTruthy();
  });

  it("should reject duplicate email", async () => {
    await User.create({ name: "A", email: "dup@test.com", password: "hashed" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "B", email: "dup@test.com", password: "password123" });
    expect(res.status).toBe(409);
  });
});
