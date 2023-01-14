const supertest = require("supertest");
const app = require("../app");

const request = supertest(app);

describe("user endpoint", () => {
  it("should create user account", async () => {
    const user = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "seller" });

    expect(user.status).toEqual(201);
  });

  it("should not create duplicate user account", async () => {
    const user = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "seller" });
    const duplicateUser = await request
      .post("/api/users")
      .send({
        username: user.body.username,
        password: "password",
        role: user.body.role,
      });

    expect(duplicateUser.status).toEqual(400);
  });
});
