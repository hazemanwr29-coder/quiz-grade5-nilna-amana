اختبار الوحدة الأولى (نيلنا أمانة) — الصف الخامس | Cloudflare Pages + D1

الحزمة تحتوي على:
- index.html: الاختبار الأصلي مع ربط الحفظ بلوحة المعلم عبر Cloudflare.
- functions/: وظائف الخلفية لحفظ النتائج، حساب الدرجة، تحميل لوحة المعلم، الإعدادات، ومسح السجل.
- schema.sql: إنشاء جداول D1.
- _routes.json: يحدد المسارات التي يجب تمريرها إلى Pages Functions.

خطوات النشر المختصرة:
1) ارفع محتويات هذه الحزمة إلى جذر مستودع GitHub خاص جديد، مثل quiz-grade5-nilna-amana.
2) في Cloudflare اختر Workers & Pages -> Create application -> Continue to Pages -> Connect to Git، ثم اربط المستودع.
3) الفرع: main، Build command: exit 0، Build output directory: .
4) أنشئ قاعدة D1 جديدة مستقلة باسم arabic-grade5-nilna-amana-db.
5) افتح D1 Console، وانسخ كل محتويات schema.sql ثم Execute.
6) في مشروع Pages: Settings -> Bindings -> Add -> D1 database. Variable name = DB، واختر arabic-grade5-nilna-amana-db. احفظ.
7) في Settings -> Variables and Secrets أضف Secret باسم TEACHER_PASSWORD وضع كلمة مرورك.
8) أعد النشر (Redeploy) بعد إضافة الـBinding والـSecret.
9) افتح رابط pages.dev، جرّب إرسال نتيجة، ثم افتح لوحة المعلم بنفس الرابط.

مهم:
- قاعدة البيانات يجب أن تكون مستقلة عن الاختبارات السابقة حتى لا تختلط النتائج.
- لا تضع كلمة المرور داخل index.html أو GitHub.
- لا ترفع index.html منفردًا؛ ارفع مجلد functions وباقي الملفات إلى الجذر.
- الدرجة الرسمية تُحسب في الخادم من مفاتيح الإجابة التي استُخرجت من QUESTIONS_BANK في الملف المرسل.
- لا تُشارك رابط Preview build، شارك رابط الإنتاج الأساسي pages.dev.
