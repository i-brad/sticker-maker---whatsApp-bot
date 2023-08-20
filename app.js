const memes = require("random-memes");
const mime = require("mime-types");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");

// Use the saved values
const client = new Client({
  puppeteer: { headless: true, env: "dev", args: ["--no-sandbox"] },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.hasMedia && msg.type !== "ptt" && msg.type !== "sticker") {
    let chat = await msg.getChat();

    if (!chat.isGroup && !msg.from.includes("status")) {
      setTimeout(async () => {
        await msg.downloadMedia().then((media) => {
          if (msg?._data?.caption) {
            makeMeme(msg, media, chat);
          } else {
            stickerize(msg, media, chat);
          }
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
            if (msg?._data?.caption?.includes("text:")) {
              makeMeme(msg, media, chat);
            } else {
              stickerize(msg, media, chat);
            }
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
    let text = msg?._data?.caption?.split(":")[1] || msg?._data?.caption;
    const extension = mime.extension(media.mimetype);
    const filename = "meme" + new Date().getTime();

    //write file
    fs.writeFile(
      `${filename}.${extension}`,
      media.data,
      { encoding: "base64" },
      function (err) {
        if (err) throw err;

        try {
          let memecontent = {
            bottomtext: text,
            savefile: true,
            filename,
            fileformat: extension,
            pictureheight: 500,
            picturewidth: 500,
          };

          memes
            .createMeme(`${filename}.${extension}`, memecontent)
            .then((meme) => {
              chat
                .sendMessage(
                  MessageMedia.fromFilePath(`./${filename}.${extension}`),
                  {
                    sendMediaAsSticker: true,
                    stickerAuthor: "Brad",
                    stickerName: "My pack",
                    stickerCategories: ["🧑‍💻"],
                  }
                )
                .then(() => {
                  msg.reply("Done stickerizing");
                  fs.unlink(`./${filename}.${extension}`, function (err) {
                    if (err) throw err;
                    console.log("File deleted!");
                  });
                });
            })
            .finally(() => {});
        } catch (err) {
          console.log("Failed", err);
        }
      }
    );
  }
};

client.initialize();
