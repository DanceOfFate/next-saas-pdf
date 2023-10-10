import { createUploadthing, type FileRouter } from "uploadthing/next";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {db} from "@/db";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {

            const { getUser } = getKindeServerSession();
            const user = getUser();

            if (!user) throw new Error("Unauthorized");

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
                    uploadStatus: "PROCCESSING"
                }
            })
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;