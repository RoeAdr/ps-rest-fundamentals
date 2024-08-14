import express from "express";
import { deleteItem, getItemDetail, getItems, upsertItem } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { idNumberRequestSchema, itemPOSTRequestSchema } from "../types";

export const itemsRouter = express.Router();

itemsRouter.get("/", async(req, res) => {
  const items = await getItems();
  items.forEach((item)=> {
    item.imageUrl = buildImageUrl(req, item.id);
  });
  res.json(items);
});


itemsRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await getItemDetail(id);
  if (item != null){
    item.imageUrl = buildImageUrl(req, item.id);
    res.json(item);
  } else {
    res.status(404).json({message:"Item Not Found"});
  }

})


// POST
itemsRouter.post("/", validate(itemPOSTRequestSchema), async(req, res) => {
  const data = itemPOSTRequestSchema.parse(req);
  const item = await upsertItem(data.body);

  if (item != null){
    res.status(201).json(item);
  } else {
    res.status(500).json({message: "Creation failed"});
  }

});



// DELETE
itemsRouter.delete("/:id", validate(idNumberRequestSchema), async (req, res) => {
  const data = idNumberRequestSchema.parse(req);
  const item = await deleteItem(data.params.id);

  if (item != null) {
    res.json(item);
    // or // res.status(200).json({message: "Item deleted"});
  } else {
    res.status(404).json({message: "Item Not Found"});
  }

});



// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
