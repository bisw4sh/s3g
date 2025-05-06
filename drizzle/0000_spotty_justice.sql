CREATE TABLE "photos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "photos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(49) NOT NULL,
	"description" varchar(254) NOT NULL,
	"url" varchar NOT NULL,
	"author" varchar(49) NOT NULL
);
