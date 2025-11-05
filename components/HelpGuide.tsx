import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button
        className="flex w-full items-center justify-between py-4 text-right"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="pb-4 text-slate-600 space-y-2 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const HelpGuide: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b">راهنمای برنامه</h2>
        <div className="space-y-2">
            <AccordionItem title="داشبورد (شروع کار)">
                <p>داشبورد نقطه شروع شماست و خلاصه‌ای از وضعیت کسب‌وکارتان را نمایش می‌دهد. این بخش به دو قسمت تقسیم شده است:</p>
                <ul className="list-disc pr-5 space-y-1">
                    <li><strong>وضعیت فعلی:</strong> آمار کلی فاکتورها، تحلیل هوشمند از داده‌های شما (مانند بهترین مشتری و پرهزینه‌ترین بخش) و یادداشت‌های روزانه را نشان می‌دهد.</li>
                    <li><strong>پیش‌بینی آینده:</strong> این بخش قدرتمند با تحلیل داده‌های شما، جریان نقدی کسب‌وکارتان را برای ۶ ماه آینده پیش‌بینی می‌کند و به شما اجازه می‌دهد سناریوهای مختلف را تست کنید.</li>
                </ul>
            </AccordionItem>
            <AccordionItem title="دستیار هوشمند">
                <p>دستیار هوشمند به شما کمک می‌کند تا کارها را سریع‌تر انجام دهید. شما می‌توانید با آن صحبت کنید یا دستورات خود را تایپ کنید.</p>
                 <p>چند مثال:</p>
                <ul className="list-disc pr-5 space-y-1 text-sm bg-slate-50 p-3 rounded-lg">
                    <li>"یک مشتری جدید به نام شرکت نوین با شماره ۰۲۱۱۲۳۴۵۶۷۸ اضافه کن."</li>
                    <li>"یک فاکتور برای شرکت نوین برای طراحی سایت به مبلغ ۱۰ میلیون تومان صادر کن."</li>
                    <li>"یک هزینه ماهانه برای اجاره دفتر به مبلغ ۵ میلیون تومان از ابتدای ماه بعد ایجاد کن."</li>
                    <li>"خلاصه وضعیت مالی چطوره؟"</li>
                </ul>
                 <p className="mt-2">همچنین می‌توانید از فاکتورها یا رسیدهای خود عکس بگیرید و با پیوست کردن آن، از دستیار بخواهید اطلاعاتش را ثبت کند.</p>
            </AccordionItem>
             <AccordionItem title="اتوماسیون (فاکتورها و هزینه‌های تکرارشونده)">
                <p>این بخش برای خودکارسازی کارهای تکراری طراحی شده است. اگر درآمد یا هزینه ثابتی دارید که به صورت ماهانه یا سالانه تکرار می‌شود، می‌توانید آن را اینجا تعریف کنید تا نرم‌افزار به صورت خودکار آن‌ها را در تاریخ مقرر ثبت کند.</p>
                 <ul className="list-disc pr-5 space-y-1">
                    <li><strong>مثال درآمد:</strong> حق اشتراک ماهانه، قرارداد پشتیبانی.</li>
                    <li><strong>مثال هزینه:</strong> اجاره دفتر، حقوق، قبض اینترنت.</li>
                    <li>می‌توانید تعیین کنید فاکتورهای خودکار به صورت "پیش‌نویس" ایجاد شوند تا قبل از ارسال آن‌ها را تایید کنید.</li>
                </ul>
            </AccordionItem>
            <AccordionItem title="گزارش‌ها">
                <p>در این بخش می‌توانید گزارش‌های دقیقی از عملکرد مالی کسب‌وکارتان در بازه‌های زمانی مختلف مشاهده کنید. این گزارش‌ها شامل موارد زیر است:</p>
                <ul className="list-disc pr-5 space-y-1">
                    <li><strong>خلاصه سود و زیان:</strong> درآمد، هزینه و سود خالص شما را در بازه زمانی انتخابی نمایش می‌دهد.</li>
                    <li><strong>هزینه‌ها بر اساس دسته‌بندی:</strong> به شما نشان می‌دهد که بیشترین هزینه‌های شما مربوط به کدام بخش‌هاست.</li>
                    <li><strong>درآمد بر اساس مشتری:</strong> لیستی از وفادارترین و پردرآمدترین مشتریان شما را نمایش می‌دهد.</li>
                </ul>
            </AccordionItem>
            <AccordionItem title="فاکتورها، مشتریان و کالاها">
                <p>این سه بخش هسته اصلی مدیریت فروش شما هستند.</p>
                 <ul className="list-disc pr-5 space-y-1">
                    <li><strong>کالاها و خدمات:</strong> ابتدا محصولات یا خدمات خود را با قیمت مشخص در این بخش تعریف کنید.</li>
                    <li><strong>مشتریان:</strong> اطلاعات مشتریان خود را در این بخش مدیریت کنید.</li>
                    <li><strong>فاکتورها:</strong> برای مشتریان خود فاکتور صادر کنید. می‌توانید از لیست کالاها و خدمات تعریف‌شده برای پر کردن سریع اقلام فاکتور استفاده کنید.</li>
                </ul>
            </AccordionItem>
             <AccordionItem title="چک‌ها و حسابداری">
                <p>این بخش‌ها برای مدیریت دقیق‌تر امور مالی طراحی شده‌اند.</p>
                 <ul className="list-disc pr-5 space-y-1">
                    <li><strong>حسابداری:</strong> تمام تراکنش‌های درآمد و هزینه خود را (چه نقدی و چه غیرنقدی) در این بخش ثبت کنید تا گزارش‌های مالی شما دقیق باشد.</li>
                    <li><strong>چک‌ها:</strong> چک‌های دریافتی و پرداختی خود را مدیریت کنید. می‌توانید وضعیت هر چک (در جریان، پاس شده، برگشتی) را تغییر دهید تا همیشه دید کاملی از وضعیت نقدینگی خود داشته باشید.</li>
                </ul>
            </AccordionItem>
        </div>
    </div>
  );
};

export default HelpGuide;
