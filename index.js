import mime from "mime-types";
import qrcode from "qrcode-terminal";
import pkg, { Client } from "whatsapp-web.js";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3030;

// your code

const { LocalAuth, MessageMedia } = pkg;
const client = new Client({
  authStrategy: new LocalAuth(),
});
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  // console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.hasMedia && msg.type !== "ptt") {
    let chat = await msg.getChat();
    if (!chat.isGroup && !msg.from.includes("status")) {
      setTimeout(async () => {
        await msg.downloadMedia().then((media) => {
          stickerize(msg, media, chat);
        });
      }, 1000);
    } else if (
      chat.isGroup &&
      !msg.from.includes("status") &&
      msg.type !== "ptt"
    ) {
      if (msg?.mentionedIds[0]?.includes("2348141879521")) {
        setTimeout(async () => {
          await msg.downloadMedia().then((media) => {
            stickerize(msg, media, chat);
          });
        }, 500);
      }
    }
  }
});

const stickerize = (msg, media, chat) => {
  if (media) {
    const extension = mime.extension(media.mimetype);
    const filename = new Date().getTime();

    try {
      if (extension !== "mp4") {
        chat
          .sendMessage(
            new MessageMedia(media.mimetype, media.data, "sticker" + filename),
            {
              sendMediaAsSticker: true,
              stickerAuthor: "Brad",
              stickerName: "My pack",
              stickerCategories: ["🧑‍💻"],
            }
          )
          .then(() => {
            msg.reply("Done stickerizing");
          });
      } else {
        msg.reply("Video to sticker feature coming soon");
      }
    } catch (err) {
      //console.log("Failed to save file", err);
    }
  }
};

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
  client.initialize();
});
