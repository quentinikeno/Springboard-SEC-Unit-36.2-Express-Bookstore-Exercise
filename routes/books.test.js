process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
	const results = await db.query(`INSERT INTO books 
    VALUES ('0691161518', 
    'http://a.co/eobPtX2', 
    'Matthew Lane', 
    'english', 
    264, 
    'Princeton University Press', 
    'Power-Up: Unlocking the Hidden Mathematics in Video Games', 
    2017)
    RETURNING *`);
	testBook = results.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM books`);
});

afterAll(async () => {
	await db.end();
});

describe("GET /books", () => {
	test("Gets all books.", async () => {
		const res = await request(app).get("/books");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ books: [testBook] });
	});
});

describe("GET /books/:bookId", () => {
	test("Gets a single book.", async () => {
		const res = await request(app).get(`/books/${testBook.isbn}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ book: testBook });
	});

	test("Throws error if book is not found.", async () => {
		const res = await request(app).get(`/books/badISBN`);
		expect(res.statusCode).toBe(404);
	});
});

describe("POST /books", () => {
	test("Create a new book.", async () => {
		data = {
			isbn: "0008324581",
			amazon_url:
				"https://www.amazon.com/Maths-Back-Envelope-calculate-anything-ebook/dp/B07Q1YY1C5/ref=sr_1_1?crid=2JYBYVQ3KRIC4&keywords=back+of+the+envelope&qid=1653707405&s=books&sprefix=back+of+the+envelope%2Cstripbooks%2C165&sr=1-1",
			author: "Rob Eastway",
			language: "english",
			pages: 208,
			publisher: "Harper Collins",
			title: "Maths on the Back of an Envelope: Clever ways to (roughly) calculate anything",
			year: 2019,
		};
		const res = await request(app).post("/books").send(data);
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ book: data });
	});

	test("Can't create a new book if required data missing in req.body.", async () => {
		const res = await request(app)
			.post("/books")
			.send({ isbn: "0008324581" });
		expect(res.statusCode).toBe(400);
	});

	test("Can't create a new book if there is a negative number of pages.", async () => {
		data = {
			isbn: "0008324581",
			amazon_url:
				"https://www.amazon.com/Maths-Back-Envelope-calculate-anything-ebook/dp/B07Q1YY1C5/ref=sr_1_1?crid=2JYBYVQ3KRIC4&keywords=back+of+the+envelope&qid=1653707405&s=books&sprefix=back+of+the+envelope%2Cstripbooks%2C165&sr=1-1",
			author: "Rob Eastway",
			language: "english",
			pages: -1,
			publisher: "Harper Collins",
			title: "Maths on the Back of an Envelope: Clever ways to (roughly) calculate anything",
			year: 2080,
		};
		const res = await request(app).post("/books").send(data);
		expect(res.statusCode).toBe(400);
	});
});

describe("PATCH /books", () => {
	test("Update a book.", async () => {
		data = {
			isbn: testBook.isbn,
			amazon_url:
				"https://www.amazon.com/Maths-Back-Envelope-calculate-anything-ebook/dp/B07Q1YY1C5/ref=sr_1_1?crid=2JYBYVQ3KRIC4&keywords=back+of+the+envelope&qid=1653707405&s=books&sprefix=back+of+the+envelope%2Cstripbooks%2C165&sr=1-1",
			author: "Rob Eastway",
			language: "english",
			pages: 208,
			publisher: "Harper Collins",
			title: "Maths on the Back of an Envelope: Clever ways to (roughly) calculate anything",
			year: 2019,
		};
		const res = await request(app)
			.put(`/books/${testBook.isbn}`)
			.send(data);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ book: data });
	});

	test("Can't update a book if required data missing in req.body.", async () => {
		const res = await request(app)
			.put(`/books/${testBook.isbn}`)
			.send({ isbn: "0008324581" });
		expect(res.statusCode).toBe(400);
	});

	test("Can't update a book if there is a negative number of pages.", async () => {
		data = {
			isbn: "0008324581",
			amazon_url:
				"https://www.amazon.com/Maths-Back-Envelope-calculate-anything-ebook/dp/B07Q1YY1C5/ref=sr_1_1?crid=2JYBYVQ3KRIC4&keywords=back+of+the+envelope&qid=1653707405&s=books&sprefix=back+of+the+envelope%2Cstripbooks%2C165&sr=1-1",
			author: "Rob Eastway",
			language: "english",
			pages: -1,
			publisher: "Harper Collins",
			title: "Maths on the Back of an Envelope: Clever ways to (roughly) calculate anything",
			year: 2080,
		};
		const res = await request(app)
			.put(`/books/${testBook.isbn}`)
			.send(data);
		expect(res.statusCode).toBe(400);
	});
});
