import { Client } from "whatsapp-web.js";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import mime from "mime-types";
import memes from "random-memes";

const { LocalAuth, MessageMedia } = pkg;
const client = new Client({
  authStrategy: new LocalAuth(),
});
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.hasMedia && msg.type !== "ptt") {
    let chat = await msg.getChat();
    if (!chat.isGroup && !msg.from.includes("status")) {
      await msg.downloadMedia().then((media) => {
        //console.log(msg);
        if (msg._data.caption.includes("--with-text")) {
          makeMeme(msg, media, chat);
        } else {
          stickerize(msg, media, chat);
        }
      });
    } else if (
      chat.isGroup &&
      !msg.from.includes("status") &&
      msg.type !== "ptt"
    ) {
      if (msg?.mentionedIds[0].includes("2348052687061")) {
        await msg.downloadMedia().then((media) => {
          if (msg._data.caption.includes("--with-text")) {
            makeMeme(msg, media, chat);
          } else {
            stickerize(msg, media, chat);
          }
        });
      }
    }
  }
});

const stickerize = (msg, media, chat) => {
  if (media) {
    const mediaPath = "./download-media";
    if (fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath);
    }

    const extension = mime.extension(media.mimetype);
    const filename = new Date().getTime();
    const fullName = mediaPath + filename + "." + extension;

    //save file
    try {
      fs.writeFileSync(fullName, media.data, { encoding: "base64" });
      //console.log("file saved successfully", filename);
      MessageMedia.fromFilePath(fullName);
      if (extension !== "mp4") {
        chat
          .sendMessage(new MessageMedia(media.mimetype, media.data, filename), {
            sendMediaAsSticker: true,
            stickerAuthor: "Braimah Destiny <Brad />",
            stickerName: "My pack",
            stickerCategories: ["🧑‍💻"],
          })
          .then(() => {
            msg.reply("Done stickerizing");
          });
      } else {
        msg.reply("Video to sticker feature coming soon");
      }

      fs.unlinkSync(fullName);
    } catch (err) {
      //console.log("Failed to save file", err);
    }
  }
};

const makeMeme = async (msg, media, chat) => {
  if (media) {
    let text = msg._data.caption.split(":")[1];
    const mediaPath = "./download-media";
    if (fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath);
    }

    const extension = mime.extension(media.mimetype);
    const filename = new Date().getTime();
    const memeFullName = mediaPath + filename + "meme";

    //save file
    fs.writeFileSync(memeFullName + "." + extension, media.data, {
      encoding: "base64",
    });

    try {
      let memecontent = {
        // toptext: "Hello",
        bottomtext: text,
        "bottomtext-y": 30,
        savefile: true,
        filename: memeFullName,
        fileformat: "png",
        pictureheight: 400,
        picturewidth: 500,
      };
      await memes.createMeme(memeFullName + "." + extension, memecontent);
      chat
        .sendMessage(MessageMedia.fromFilePath(memeFullName + "." + "png"), {
          sendMediaAsSticker: true,
          stickerAuthor: "Braimah Destiny <Brad />",
          stickerName: "My pack",
          stickerCategories: ["🧑‍💻"],
        })
        .then(() => {
          msg.reply("Done stickerizing");
        });
      fs.unlinkSync(memeFullName + "." + extension);
      fs.unlinkSync(memeFullName + "." + "png");
    } catch (err) {
      console.log("Failed to save file", err);
    }
  }
};

client.initialize();
