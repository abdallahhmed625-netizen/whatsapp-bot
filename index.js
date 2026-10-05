const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// اسم نقابة الأنيمي
const GUILD_NAME = "K.N.H』☯︎『𝑲𝑰𝑵𝑮𝑫𝑶𝑴』👑";

// تتبع سبام الرسائل (أكثر من 5 رسائل في 5 ثوانٍ)
const userMessageLog = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('امسح رمز QR أعلاه لتشغيل البوت!');
});

client.on('ready', () => {
    console.log(`بوت نقابة ${GUILD_NAME} يعمل بنجاح!`);
});

// الترحيب بالأعضاء الجدد عند الانضمام
client.on('group_join', async (notification) => {
    const chat = await notification.getChat();
    const contact = await client.getContactById(notification.recipientIds[0]);
    
    const welcomeMessage = `🏰 *مرحباً بك في نقابة ${GUILD_NAME}* 🏰\n\n` +
        `أهلاً بك يا فرسان الأنيمي @${contact.id.user}!\n` +
        `نتمنى لك وقتاً ممتعاً معنا. اكتب *.الاوامر* لتتعرف على ما يمكن للبوت فعله.`;
    
    chat.sendMessage(welcomeMessage, { mentions: [contact] });
});

// حماية الجروب من الأسبام ومعالجة الأوامر
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;

    const senderId = msg.author || msg.from;
    const currentTime = Date.now();

    // 1. نظام كشف وحظر الأسبام (Spam Protection)
    if (!userMessageLog[senderId]) {
        userMessageLog[senderId] = [];
    }
    userMessageLog[senderId].push(currentTime);
    userMessageLog[senderId] = userMessageLog[senderId].filter(time => currentTime - time < 5000);

    if (userMessageLog[senderId].length > 5) {
        msg.reply("⚠️ *تنبيه أسبام!* تم إخراجك من النقابة لمخالفة القوانين.");
        try {
            await chat.removeParticipants([senderId]);
        } catch (err) {
            console.log("تأكد من إعطاء البوت صلاحية مشرف (Admin) ليتمكن من طرد المخالفين.");
        }
        return;
    }

    const body = msg.body.trim();

    // 2. قائمة الأوامر
    if (body === '.الاوامر' || body === '.أوامر') {
        const menu = `📜 *قائمة أوامر نقابة ${GUILD_NAME}* 📜\n\n` +
            `⚔️ *.نقابة* - معلومات عن النقابة والقوانين\n` +
            `🎉 *.فعالية* - بدء فعالية أنيمي اختيارية\n` +
            `❓ *.سؤال* - سؤال أنيمي عشوائي اختبر به معلوماتك\n` +
            `👑 *.الرتب* - عرض رتب ونظام النقابة\n` +
            `🛡️ *.منع_السبام* - البوت يطرد تلقائياً أي شخص يرسل رسائل سريعة جداً`;
        msg.reply(menu);
    }

    // 3. أمر معلومات النقابة
    if (body === '.نقابة') {
        msg.reply(`🛡️ *نقابة ${GUILD_NAME}*\n\nتجمع محبي وخبراء الأنيمي! احترم الأعضاء وشارك في الفعاليات لتكون من النخبة.`);
    }

    // 4. أمر رتب النقابة
    if (body === '.الرتب') {
        const ranks = `🎖️ *رتب النقابة:*\n\n` +
            `👑 الملك (القائد)\n` +
            `⚔️ فارس النقابة (عضو متفاعل)\n` +
            `🛡️ المبتدئ (عضو جديد)`;
        msg.reply(ranks);
    }

    // 5. أمر فعالية أنيمي
    if (body === '.فعالية') {
        const events = [
            "🎮 *فعالية اليوم:* تخمين اسم الشخصية من خلال إيموجي (🔥⚡🗡️)!",
            "🎨 *فعالية اليوم:* شاركنا بأفضل خلفية أنيمي لديك الآن!",
            "🏆 *فعالية اليوم:* تصويت أفضل أنيمي في الموسم الحالي!"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        msg.reply(randomEvent);
    }

    // 6. سؤال أنيمي عشوائي
    if (body === '.سؤال') {
        const questions = [
            "❓ *سؤال:* ما هو اسم السيف الخاص بـ زورو في أنيمي ون بيس الذي حصل عليه في وانو؟",
            "❓ *سؤال:* من هو القائد الأول لفرقة الحماية الـ 13 في أنيمي بليتش؟",
            "❓ *سؤال:* ما هي تقنية ناروتو الشهيرة التي اخترعها الهوكاجي الرابع؟"
        ];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        msg.reply(randomQ);
    }
});

client.initialize();
