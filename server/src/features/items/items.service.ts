import { PrismaClient } from "@prisma/client";
import { Item, ItemDTO, ItemDetail } from "../types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import TTLCache from "@isaacs/ttlcache";

const prisma = new PrismaClient();
const options = {ttl: 1000 * 60 * 60 * 24}; // 1 Day in mms
const cache = new TTLCache(options);
const listKey = "items-list";


export function getItems(): Promise<Item[]> {
  const cacheItems = cache.get<Item[]>(listKey);
if (cacheItems != undefined) {
  return Promise.resolve(cacheItems);
}

  return prisma.item.findMany({
    select: {
      id: true,
      name: true,
    },
  })
  .then((items) => {
    cache.set(listKey, items);
    return items;
  }  
  );  
}

export function getItemDetail(itemId: number): Promise<ItemDetail | null> {
  return prisma.item.findFirst({
    where: { id: itemId },
  });
}

export function upsertItem(
  item: ItemDTO,
  itemId?: number | null
): Promise<Item | null> {
  return prisma.item.upsert({
    where: {
      id: itemId || -1,
    },
    update: {
      name: item.name,
      description: item.description,
    },
    create: {
      name: item.name,
      description: item.description,
    },
  });
}

export function deleteItem(itemId: number): Promise<Item | null> {
  return prisma.item
    .delete({
      where: { id: itemId },
    })
    .catch((error) => {
      if (
        error instanceof PrismaClientKnownRequestError &&
        (error as PrismaClientKnownRequestError).code == "P2025"
      ) {
        return Promise.resolve(null);
      } else {
        throw error;
      }
    });
}
