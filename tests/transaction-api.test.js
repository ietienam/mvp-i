const supertest = require("supertest");
const app = require("../app");

const request = supertest(app);

describe("buy endpoint", () => {
  let product, seller, sellerAuthToken;

  beforeEach(async () => {
    seller = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "seller" });
    sellerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: seller.body.username, password: seller.body.password });

    product = await request
      .post("/products")
      .set("Authorization", `Bearer ${sellerAuthToken.body}`)
      .send({ amountAvailable: 5, cost: 3, productName: "test" });
  });

  it("should allow buyer to make purchase", async () => {
    const depositValue = 10;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    const purchase = await request
      .post(`/buy/${product.id}`)
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ amountOfProducts: 2 });

    expect(purchase.status).toEqual(200);
    expect(purchase.body.totalSpent).toEqual(6);
    expect(purchase.body.change).toEqual([]);
    expect(parseInt(purchase.body.product.amountAvailable)).toEqual(
      parseInt(purchase.body.product.amountAvailable) - 2
    );
  });

  it("should not allow buyer to make purchase", async () => {
    const depositValue = 10;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    await request
      .post("/api/deposit")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    const purchase = await request
      .post(`/buy/${product.id}`)
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ amountOfProducts: 3 });

    expect(purchase.status).toEqual(400);
    expect(purchase.body).toEqual("Insufficient balance");
  });

  it("should not allow seller to make purchase", async () => {
    const purchase = await request
      .post(`/buy/${product.id}`)
      .set("Authorization", `Bearer ${sellerAuthToken.body}`)
      .send({ amountOfProducts: 3 });

    expect(purchase.status).toEqual(403);
    expect(purchase.body).toEqual(
      "You do not have permission to perform this action!"
    );
  });

  it("should not allow unauthenticated purchases", async () => {
    const purchase = await request
      .post(`/buy/${product.id}`)
      .send({ amountOfProducts: 2 });

    expect(purchase.status).toEqual(401);
    expect(purchase.body).toEqual("Access denied! Please login");
  });

  it("should not allow authenticated purchases from buyers that no longer exist", async () => {
    const depositValue = 10;
    const buyer = await request
      .post("/api/users")
      .send({ username: "user", password: "password", role: "buyer" });
    const buyerAuthToken = await request
      .post("/api/auth/login")
      .send({ username: buyer.body.username, password: buyer.body.password });
    await request
      .delete("/api/users")
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ deposit: depositValue });

    const purchase = await request
      .post(`/buy/${product.id}`)
      .set("Authorization", `Bearer ${buyerAuthToken.body}`)
      .send({ amountOfProducts: 2 });

    expect(purchase.status).toEqual(401);
    expect(purchase.body).toEqual("The user for this token no longer exists!");
  });
});
