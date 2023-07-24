const mime = require("mime-types");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");

// your code

const client = new Client({
  puppeteer: { headless: true, env: "dev", args: ["--no-sandbox"] },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  // console.log("Client is ready!");
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
              msg: "testing",
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

client.on("message", async (msg) => {
  // if (
  //   (msg?._data?.body?.toLowerCase()?.includes("hey") ||
  //     msg?._data?.body?.toLowerCase()?.includes("bot")) &&
  //   chat.isGroup &&
  //   msg.from.includes("status")
  // ) {
  //   setTimeout(() => {
  //     msg.reply(
  //       "Good day. I'm a friend of Brad, a sticker bot... read my description(bio) for more information"
  //     );
  //   }, 2000);
  //   return;
  // }
  // console.log(msg);
  if (msg.hasMedia && msg.type !== "ptt" && msg.type !== "sticker") {
    let chat = await msg.getChat();
    if (!chat.isGroup && !msg.from.includes("status")) {
      await msg.downloadMedia().then((media) => {
        setTimeout(() => {
          stickerize(msg, media, chat);
        }, 2000);
      });
    } else if (
      chat.isGroup &&
      !msg.from.includes("status") &&
      msg.type !== "ptt"
    ) {
      if (msg?.mentionedIds[0]?.includes("2348141879521")) {
        await msg.downloadMedia().then((media) => {
          stickerize(msg, media, chat);
        });
      }
    }
  }
});

client.initialize();
