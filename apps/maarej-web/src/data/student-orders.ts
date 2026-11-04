// Frontend view model only; not a backend schema or booking policy.
export type OrderStatus='draft'|'submitted'|'pending'|'approved'|'confirmed'|'rejected'|'cancelled'|'completed';
export type OrderEventType='created'|'submitted'|'payment_recorded'|'approved'|'rejected'|'confirmed'|'cancelled'|'completed';
export type Order={id:string;displayId:string;type:string;typeLabel:string;status:OrderStatus;createdAt:string;studentId:string;
 provider?:{type:'teacher'|'center'|'cospace';id:string;name:string;image?:string|null;subject?:string|null;branch?:string|null;rating?:number|null}|null;
 service?:{subjectId?:string;subjectName?:string;teacherName?:string;groupId?:string;groupName?:string;sessionId?:string}|null;
 location?:{centerId?:string;centerName?:string;branchId?:string;branchName?:string;roomId?:string;roomName?:string;address?:string}|null;
 schedule?:{startAt?:string;endAt?:string;durationMinutes?:number}|null;
 finance?:{currency:string;total?:number;paid?:number;remaining?:number;paymentStatus?:string;transactions:readonly {id:string;amount:number;recordedAt:string;transactionId?:string}[]}|null;
 timeline:readonly {id:string;type:OrderEventType;title:string;timestamp:string;description?:string}[];
 nextAction?:{kind:'support';label:string;unavailableReason:string};};
export const statusContent:Record<OrderStatus,{label:string;description:string;next:string;nextDescription:string;tone:'info'|'attention'|'success'|'error'}>={
 draft:{label:'مسودة',description:'لم يتم إرسال الطلب بعد.',next:'الطلب لم يُرسل بعد',nextDescription:'هذه مسودة الطلب المحفوظة.',tone:'info'},
 submitted:{label:'تم الإرسال',description:'تم إرسال طلبك إلى الجهة المقدمة للخدمة.',next:'ننتظر مراجعة الطلب',nextDescription:'سيظهر لك التحديث هنا بمجرد مراجعة الطلب.',tone:'info'},
 pending:{label:'قيد المراجعة',description:'تم إرسال طلبك، وننتظر تأكيد الجهة المقدمة للخدمة.',next:'ننتظر تأكيد الحجز.',nextDescription:'سيظهر لك التحديث هنا بمجرد مراجعة الطلب.',tone:'attention'},
 approved:{label:'تمت الموافقة',description:'تمت الموافقة على طلبك. راجع تفاصيل التأكيد المسجلة.',next:'تمت الموافقة — راجع تفاصيل التأكيد',nextDescription:'الموافقة هي الحالة المسجلة حاليًا على الطلب.',tone:'info'},
 confirmed:{label:'الحجز مؤكد',description:'تم تأكيد الحجز. تفاصيل المكان والموعد موضحة أدناه.',next:'الحجز مؤكد',nextDescription:'راجع موعد الحجز والمكان قبل الحضور.',tone:'success'},
 rejected:{label:'لم يُقبل الطلب',description:'تعذر قبول طلب الحجز. راجع التحديث المسجل في سجل الطلب.',next:'تعذر قبول الطلب',nextDescription:'راجع تفاصيل الرد المسجلة أدناه.',tone:'error'},
 cancelled:{label:'ملغي',description:'الطلب مسجل كطلب ملغي.',next:'تم إلغاء الطلب',nextDescription:'يمكنك الرجوع إلى سجل الطلب للاطلاع على التحديثات.',tone:'error'},
 completed:{label:'مكتمل',description:'تم تسجيل اكتمال الخدمة.',next:'تمت الخدمة',nextDescription:'يمكنك الرجوع إلى تفاصيل الحجز والسجلات المالية أدناه.',tone:'success'},
};
