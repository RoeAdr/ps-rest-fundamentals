import express from "express";
import { deleteItem, getItemDetail, getItems, upsertItem } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { create } from "xmlbuilder2";
import { idNumberRequestSchema, itemPOSTRequestSchema, itemPUTRequestSchema } from "../types";
import { it } from "node:test";

export const itemsRouter = express.Router();


// call http://localhost:4000/api/items
// if xml: set header.Accept to "application/xml"
itemsRouter.get("/", async(req, res) => {
  const items = await getItems();
  items.forEach((item)=> {
    item.imageUrl = buildImageUrl(req, item.id);
  });

  // Content type xml
  if (req.headers["accept"] == "application/xml"){
    const root = create().ele("items");
    items.forEach((i) => {
      root.ele("item", i);
    });
    res.status(200).send(root.end({prettyPrint: true}));
    // Note: node needs to use a xml builder library -  C# has one out of the box...
  } else {
    res.json(items);
  }
});


itemsRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await getItemDetail(id);
  if (item != null){
    item.imageUrl = buildImageUrl(req, item.id);

    // Content type xml
    if (req.headers["accept"] == "application/xml"){
      res.status(200).send(create().ele("item",item).end());
    } else {
      res.json(item);
    }
  } else {
    if (req.headers["accept"] == "application/xml"){
      res
        .status(400)
        .send(create().ele("error", {message: "Itemo Not Found"}).end());
    } else {
    res.status(404).json({message:"Item Not Found"});
    }
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



// PUT
itemsRouter.put("/:id", validate(itemPUTRequestSchema), async (req, res) => {
  const data = itemPUTRequestSchema.parse(req);
  const item = await upsertItem(data.body, data.params.id);

  if (item != null) {
    res.json(item);    
  } else {
    res.status(404).json({message: "Item Not Found"});
  }
});



// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
