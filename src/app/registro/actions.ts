"use server";

import { prisma } from "@/lib/prisma";

export async function fetchBarrios() {
  return await prisma.barrio.findMany({
    include: {
      comuna: {
        include: {
          municipio: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });
}
