// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyCzacPBbWLAtAeNF5bsPeeQLcxWdKE0s5c",
  authDomain: "respect-s2-gang.firebaseapp.com",
  projectId: "respect-s2-gang",
  storageBucket: "respect-s2-gang.firebasestorage.app",
  messagingSenderId: "686807471369",
  appId: "1:686807471369:web:95232359e81648cf8f2fd8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= عناصر الصفحة =================
const map = document.getElementById("map");
const unlockBtn = document.getElementById("unlockBtn");
const sprayPanel = document.getElementById("sprayPanel");
const sprayBtn = document.getElementById("sprayBtn");
const colorPicker = document.getElementById("colorPicker");
const gangInput = document.getElementById("gangName");

const PASSWORD = "38657";

let unlocked = false;
let sprayMode = false;

// ================= فتح الصلاحية =================
unlockBtn.onclick = () => {
    const code = prompt("ادخل رمز البخاخ:");
    if (code === PASSWORD) {
        unlocked = true;
        sprayPanel.style.display = "block";
        unlockBtn.innerText = "✅ مفعل";
        alert("تم تفعيل وضع البخاخ");
    } else {
        alert("❌ رمز خاطئ");
    }
};

// ================= زر الرش =================
sprayBtn.onclick = () => {
    if (!unlocked) return;

    if (gangInput.value.trim() === "") {
        alert("اكتب اسم العصابة");
        return;
    }

    sprayMode = true;
    sprayBtn.innerText = "اضغط على الخريطة";
};

// ================= تحميل البخاخات مباشرة =================
db.collection("sprays").onSnapshot(snapshot => {
    document.querySelectorAll(".spray").forEach(e => e.remove());

    snapshot.forEach(doc => {
        const d = doc.data();
        createSpray(d.x, d.y, d.color, d.name, doc.id);
    });
});

// ================= إنشاء بخاخ =================
function createSpray(x, y, color, name, id) {

    const spray = document.createElement("div");
    spray.className = "spray";

    // حجم صغير
    const size = 24;
    spray.style.left = (x - size / 2) + "px";
    spray.style.top = (y - size / 2) + "px";

    spray.style.width = size + "px";
    spray.style.height = size + "px";

    spray.style.background = color;
    spray.style.borderColor = color;

    // اسم العصابة
    const label = document.createElement("div");
    label.className = "gang-name";
    label.innerText = name;

    // نقطة المنتصف
    const center = document.createElement("div");
    center.className = "center-point";

    spray.appendChild(label);
    spray.appendChild(center);

    // 🧹 حذف البخاخ (فقط بعد إدخال الرمز)
   spray.addEventListener("click", (e) => {
    e.stopPropagation();
        if (!unlocked) return;

        const confirmDelete = confirm("هل تريد حذف هذا البخاخ؟");
        if (confirmDelete) {
            db.collection("sprays").doc(id).delete();
        }
    });

    map.appendChild(spray);
}

// ================= الضغط على الخريطة =================
map.addEventListener("click", e => {
    if (!sprayMode || !unlocked) return;

    const rect = map.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // حذف بخاخ إذا لمس مركزه
    db.collection("sprays").get().then(snapshot => {
        snapshot.forEach(doc => {
            const d = doc.data();
            const dx = x - d.x;
            const dy = y - d.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 10) {
                db.collection("sprays").doc(doc.id).delete();
            }
        });

        // إضافة الجديد
        db.collection("sprays").add({
            x: x,
            y: y,
            color: colorPicker.value,
            name: gangInput.value
        });
    });

    sprayMode = false;
    sprayBtn.innerText = "🧴 رش بخاخ";
});
