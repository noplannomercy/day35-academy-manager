'use client';

import { Payment, Student, Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Receipt, User, GraduationCap, Calendar, Wallet, CreditCard, FileText } from 'lucide-react';

interface PaymentDetailProps {
  payment: Payment;
  student: Student;
  class: Class;
}

export function PaymentDetail({ payment, student, class: classData }: PaymentDetailProps) {
  return (
    <div className="space-y-6">
      {/* Payment Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            수납 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">월</div>
              <div className="font-medium">
                {format(new Date(payment.month + '-01'), 'yyyy년 M월', { locale: ko })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">상태</div>
              <StatusBadge status={payment.status} label={PAYMENT_STATUS_LABELS[payment.status]} />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">수강료</div>
              <div className="text-lg font-bold text-gray-900">
                {payment.amount.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">납부액</div>
              <div className="text-lg font-bold text-green-600">
                {payment.paidAmount.toLocaleString()}원
              </div>
            </div>
            {payment.amount - payment.paidAmount > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">잔액</div>
                <div className="text-lg font-bold text-orange-600">
                  {(payment.amount - payment.paidAmount).toLocaleString()}원
                </div>
              </div>
            )}
            {payment.isProrated && (
              <div>
                <div className="text-sm text-gray-600 mb-1">일할계산</div>
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium">
                  적용됨
                </div>
              </div>
            )}
          </div>

          {payment.paidDate && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">납부 내역</div>
              <div className="flex items-center gap-4 bg-green-50 p-3 rounded-lg">
                <div>
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(payment.paidDate), 'yyyy년 M월 d일', { locale: ko })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment.method && PAYMENT_METHOD_LABELS[payment.method]}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {payment.paidAmount.toLocaleString()}원
                </div>
              </div>
            </div>
          )}

          {payment.notes && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-1">메모</div>
              <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {payment.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            학생 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">이름</div>
              <div className="font-medium">{student.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">연락처</div>
              <div className="font-medium">{student.phone}</div>
            </div>
            {student.parentPhone && (
              <div>
                <div className="text-sm text-gray-600 mb-1">학부모 연락처</div>
                <div className="font-medium">{student.parentPhone}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-1">상태</div>
              <StatusBadge
                status={student.status}
                label={
                  student.status === 'active'
                    ? '수강중'
                    : student.status === 'inactive'
                    ? '일시중단'
                    : '퇴원'
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            반 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">반명</div>
              <div className="font-medium">{classData.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">월 수강료</div>
              <div className="font-medium">{classData.monthlyFee.toLocaleString()}원</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">정원</div>
              <div className="font-medium">{classData.maxStudents}명</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">상태</div>
              <StatusBadge
                status={classData.status}
                label={classData.status === 'active' ? '진행중' : '종료'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
