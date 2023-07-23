import mime from "mime-types";
import qrcode from "qrcode-terminal";
// import memes from "random-memes";
import pkg, { Client } from "whatsapp-web.js";

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
          // if (msg?._data?.caption) {
          //   makeMeme(msg, media, chat);
          // } else {
          //   stickerize(msg, media, chat);
          // }
          stickerize(msg, media, chat);
        });
      }, 1000);
    } else if (
      chat.isGroup &&
      !msg.from.includes("status") &&
      msg.type !== "ptt"
    ) {
      if (msg?.mentionedIds[0]?.includes("2348052687061")) {
        setTimeout(async () => {
          await msg.downloadMedia().then((media) => {
            // if (msg?._data?.caption?.includes("--with-text")) {
            //   makeMeme(msg, media, chat);
            // } else {
            //   stickerize(msg, media, chat);
            // }
            stickerize(msg, media, chat);
          });
        }, 1000);
      }
    }
  }
});

const stickerize = (msg, media, chat) => {
  if (media) {
    const extension = mime.extension(media.mimetype);
    const filename = new Date().getTime();

    //save file
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

const makeMeme = async (msg, media, chat) => {
  if (media) {
    let text = msg?._data?.caption?.split(":")[1];
    const extension = mime.extension(media.mimetype);
    const filename = "meme" + new Date().getTime();

    try {
      let memecontent = {
        // toptext: "Hello",
        bottomtext: text,
        "bottomtext-y": 30,
        getbuffer: true,
        filename,
        fileformat: extension,
        pictureheight: 400,
        picturewidth: 500,
      };
      console.log(media);
      memes.createMeme(media?.data, memecontent).then((meme) => {
        console.log(meme);
        chat
          .sendMessage(
            new MessageMedia(media.mimetype, meme, "sticker" + filename),
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
      });
    } catch (err) {
      console.log("Failed", err);
    }
  }
};

client.initialize();
