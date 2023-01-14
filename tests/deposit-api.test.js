const supertest = require("supertest");
const app = require("../app");

const request = supertest(app);

describe("deposit endpoint", () => {
  it("should allow deposit to buyer account", async () => {
    const depositValue = 10;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    const deposit = await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(200);

    const previousDepositValue = parseInt(buyer.body.deposit);

    expect(previousDepositValue + depositValue).toEqual(
      parseInt(deposit.body.deposit)
    );
  });

  it("should not allow deposit to buyer account", async () => {
    const depositValue = 7;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    const deposit = await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(400);
    expect(deposit.body).toEqual(
      "Invalid coin deposited! Please enter a valid coin deposit"
    );
  });

  it("should not allow buyer to deposit more than 1 coin at a time", async () => {
    const depositValue = [10, 5];
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    const deposit = await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(400);
  });

  it("should not allow unauthenticated deposits", async () => {
    const depositValue = 5;
    const deposit = await request
      .post("/api/deposit")
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(401);
    expect(deposit.body).toEqual("Access denied! Please login");
  });

  it("should not allow authenticated deposits from buyer that no longer exists", async () => {
    const depositValue = 10;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    await request
      .delete("/api/users")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`);
    const deposit = await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(401);
    expect(deposit.body).toEqual("The user for this token no longer exists!");
  });

  it("should not allow deposit to seller account", async () => {
    const depositValue = 5;
    const seller = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "seller" });
    const sellerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: seller.body.username, password: seller.body.password });
    const deposit = await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${sellerAuthToken.body}`)
      .send({ deposit: depositValue });

    expect(deposit.status).toEqual(403);
    expect(deposit.body).toEqual(
      "You do not have permission to perform this action!"
    );
  });
});
