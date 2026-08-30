import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsAPI, saloonAPI } from '../../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';
import {
  TrendingUp, Calendar, CheckCircle2, XCircle,
  Award, Trophy, Medal, Scissors, BarChart2, Download, FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Period config ─────────────────────────────────────────────────────────
const PERIODS = [
  { label: 'Today', value: '1d' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

// ── Custom tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: '12px', padding: '0.75rem 1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <p style={{ fontWeight: 700, fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontWeight: 800, fontSize: '0.95rem', color: '#000', margin: 0 }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

// ── KPI Tile ──────────────────────────────────────────────────────────────
function KpiTile({ icon: Icon, label, value, sub, iconBg, iconColor }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: '20px', padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 900, fontSize: '1.75rem', color: '#000',
        margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
      }}>{value}</p>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
        marginTop: '0.4rem', marginBottom: 0,
      }}>{label}</p>
      {sub && (
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', marginTop: '0.25rem',
        }}>{sub}</p>
      )}
    </div>
  );
}

// ── Chart card ────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: '20px', padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '1rem', color: '#000', margin: 0,
        }}>{title}</h3>
        {subtitle && (
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0 0',
          }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── PDF Generator ─────────────────────────────────────────────────────────
function generatePDF({ saloon, analytics, performance, period }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;

  const periodLabel = PERIODS.find(p => p.value === period)?.label || period;
  const now = new Date();
  const generatedAt = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const ov = analytics?.overview || {};
  const totalRevenue    = ov.totalRevenue ?? 0;
  const totalBookings   = ov.totalAppointments ?? 0;
  const completed       = ov.completedAppointments ?? 0;
  const cancelled       = ov.cancelledAppointments ?? 0;
  const pending         = ov.pendingAppointments ?? 0;
  const barberCount     = ov.barberCount ?? 0;
  const successRate     = totalBookings > 0 ? ((completed / totalBookings) * 100).toFixed(1) : '0.0';
  const cancelRate      = totalBookings > 0 ? ((cancelled / totalBookings) * 100).toFixed(1) : '0.0';
  const avgPerBooking   = completed > 0 ? (totalRevenue / completed).toFixed(0) : '0';
  const dailyRevenue    = analytics?.dailyRevenue || [];

  let y = 0;

  // ── Helper: add a new page footer + continue ─────────────────────────────
  const addPageFooter = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `SmartSalon Analytics Report  ·  Confidential  ·  Generated ${generatedAt}`,
      pageW / 2, pageH - 8,
      { align: 'center' }
    );
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  };

  // ═══════════════════════════════════════════
  // ── COVER HEADER BAND ──────────────────────
  // ═══════════════════════════════════════════
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageW, 58, 'F');

  // Accent stripe
  doc.setFillColor(80, 80, 80);
  doc.rect(0, 54, pageW, 4, 'F');

  // Salon name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(saloon?.name || 'Salon', margin, 22);

  // Report title tag
  doc.setFontSize(8.5);
  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('ANALYTICS & PERFORMANCE REPORT', margin, 31);

  // Divider
  doc.setDrawColor(70, 70, 70);
  doc.line(margin, 35, pageW - margin, 35);

  // Period + date meta
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`Period: ${periodLabel}`, margin, 43);
  doc.text(`Generated: ${generatedAt}`, margin, 50);

  // Top-right badge
  doc.setFillColor(40, 40, 40);
  doc.roundedRect(pageW - margin - 32, 10, 32, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text('OFFICIAL REPORT', pageW - margin - 16, 18.5, { align: 'center' });

  y = 70;

  // ═══════════════════════════════════════════
  // ── SECTION 1: EXECUTIVE SUMMARY ───────────
  // ═══════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('EXECUTIVE SUMMARY', margin, y);

  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(0.8);
  doc.line(margin, y + 2, margin + 42, y + 2);
  doc.setLineWidth(0.2);
  y += 8;

  // Brief intro paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const introParts = doc.splitTextToSize(
    `This report provides a comprehensive overview of ${saloon?.name || 'the salon'}'s operational and financial performance for the selected reporting period (${periodLabel}). It covers key booking metrics, revenue analytics, and individual barber performance rankings.`,
    contentW
  );
  doc.text(introParts, margin, y);
  y += introParts.length * 4.5 + 5;

  // KPI Metric Boxes (2 rows × 3 cols)
  const kpis = [
    { label: 'Total Revenue',     value: `LKR ${totalRevenue.toLocaleString()}`,  bg: [240, 253, 244], accent: [22, 163, 74]  },
    { label: 'Total Bookings',    value: String(totalBookings),                    bg: [239, 246, 255], accent: [37, 99, 235]  },
    { label: 'Completed',         value: String(completed),                        bg: [240, 253, 244], accent: [22, 163, 74]  },
    { label: 'Avg. per Booking',  value: `LKR ${Number(avgPerBooking).toLocaleString()}`, bg: [255, 251, 235], accent: [217, 119, 6] },
    { label: 'Success Rate',      value: `${successRate}%`,                        bg: [240, 253, 244], accent: [22, 163, 74]  },
    { label: 'Cancellation Rate', value: `${cancelRate}%`,                         bg: [254, 242, 242], accent: [220, 38, 38]  },
  ];

  const cols = 3;
  const boxW = (contentW - (cols - 1) * 5) / cols;
  const boxH = 22;
  const boxGap = 5;

  for (let i = 0; i < kpis.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = margin + col * (boxW + boxGap);
    const by = y + row * (boxH + boxGap);

    const k = kpis[i];
    // Box background
    doc.setFillColor(...k.bg);
    doc.roundedRect(bx, by, boxW, boxH, 3, 3, 'F');

    // Accent top border
    doc.setFillColor(...k.accent);
    doc.roundedRect(bx, by, boxW, 1.5, 0.5, 0.5, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(k.label.toUpperCase(), bx + 4, by + 7);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(k.value, bx + 4, by + 17);
  }

  const rowCount = Math.ceil(kpis.length / cols);
  y += rowCount * (boxH + boxGap) + 4;

  // Additional info row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Active Barbers: ${barberCount}   ·   Pending/Confirmed: ${pending}   ·   Cancelled: ${cancelled}`,
    margin, y
  );
  y += 10;

  // ═══════════════════════════════════════════
  // ── SECTION 2: REVENUE ANALYTICS ───────────
  // ═══════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('REVENUE ANALYTICS', margin, y);

  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(0.8);
  doc.line(margin, y + 2, margin + 40, y + 2);
  doc.setLineWidth(0.2);
  y += 8;

  // Revenue summary paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const revSummary = doc.splitTextToSize(
    `Over the ${periodLabel.toLowerCase()} period, the salon generated a total revenue of LKR ${totalRevenue.toLocaleString()} from ${completed} completed appointments, averaging LKR ${Number(avgPerBooking).toLocaleString()} per appointment. The ${dailyRevenue.length} days of data below reflect the daily breakdown.`,
    contentW
  );
  doc.text(revSummary, margin, y);
  y += revSummary.length * 4.5 + 5;

  if (dailyRevenue.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Appointments', 'Revenue (LKR)']],
      body: dailyRevenue.map(d => [
        d._id,
        String(d.count),
        `LKR ${Number(d.revenue).toLocaleString()}`,
      ]),
      foot: [[
        'TOTAL',
        String(dailyRevenue.reduce((s, d) => s + (d.count || 0), 0)),
        `LKR ${dailyRevenue.reduce((s, d) => s + (d.revenue || 0), 0).toLocaleString()}`,
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [10, 10, 10],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [10, 10, 10],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3.5,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 'auto', halign: 'right' },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('No daily revenue data available for this period.', margin, y);
    y += 10;
  }

  // ═══════════════════════════════════════════
  // ── SECTION 3: BARBER PERFORMANCE ──────────
  // ═══════════════════════════════════════════

  // Check if we need a new page
  if (y > pageH - 80) {
    addPageFooter();
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('BARBER PERFORMANCE RANKING', margin, y);

  doc.setDrawColor(10, 10, 10);
  doc.setLineWidth(0.8);
  doc.line(margin, y + 2, margin + 58, y + 2);
  doc.setLineWidth(0.2);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const perfSummary = doc.splitTextToSize(
    `The table below ranks all ${performance.length} stylist(s) by total revenue generated during the reporting period. Ranking is based on completed appointment revenue contribution.`,
    contentW
  );
  doc.text(perfSummary, margin, y);
  y += perfSummary.length * 4.5 + 5;

  if (performance.length > 0) {
    const sortedPerf = [...performance].sort(
      (a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)
    );
    const totalPerfRevenue = sortedPerf.reduce((s, b) => s + (b.totalRevenue || 0), 0);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Rank', 'Stylist Name', 'Completed', 'Cancelled', 'Revenue (LKR)', 'Share']],
      body: sortedPerf.map((b, i) => {
        const share = totalPerfRevenue > 0
          ? ((b.totalRevenue / totalPerfRevenue) * 100).toFixed(1)
          : '0.0';
        const rankMedal = i === 0 ? '>> #1' : i === 1 ? '>> #2' : i === 2 ? '>> #3' : `#${i + 1}`;
        return [
          rankMedal,
          b.name || 'Stylist',
          String(b.completedBookings || 0),
          String(b.cancelledBookings || 0),
          `LKR ${(b.totalRevenue || 0).toLocaleString()}`,
          `${share}%`,
        ];
      }),
      foot: [[
        '',
        `TOTAL (${sortedPerf.length} stylists)`,
        String(sortedPerf.reduce((s, b) => s + (b.completedBookings || 0), 0)),
        String(sortedPerf.reduce((s, b) => s + (b.cancelledBookings || 0), 0)),
        `LKR ${totalPerfRevenue.toLocaleString()}`,
        '100%',
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [10, 10, 10],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [10, 10, 10],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 3.5,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 24, halign: 'center' },
        4: { cellWidth: 38, halign: 'right' },
        5: { cellWidth: 18, halign: 'right' },
      },
      // Highlight top performer row
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index === 0) {
          doc.setFillColor(240, 253, 244);
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('No barber performance data available for this period.', margin, y);
    y += 10;
  }

  // ═══════════════════════════════════════════
  // ── SECTION 4: INSIGHTS & NOTES ────────────
  // ═══════════════════════════════════════════
  if (y < pageH - 60) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('KEY INSIGHTS', margin, y);
    doc.setDrawColor(10, 10, 10);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 26, y + 2);
    doc.setLineWidth(0.2);
    y += 9;

    const insights = [];
    if (parseFloat(successRate) >= 80) {
      insights.push(`[OK]  Strong booking success rate of ${successRate}% indicates high customer satisfaction and effective service delivery.`);
    } else if (parseFloat(successRate) >= 60) {
      insights.push(`[!]   Moderate success rate of ${successRate}%. Consider reviewing appointment reminders or cancellation policies.`);
    } else {
      insights.push(`[X]   Low success rate of ${successRate}%. Investigate cancellation root causes and consider customer re-engagement strategies.`);
    }

    if (performance.length > 0) {
      const topBarber = [...performance].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))[0];
      insights.push(`[OK]  Top-performing stylist: ${topBarber.name} with LKR ${(topBarber.totalRevenue || 0).toLocaleString()} in revenue and ${topBarber.completedBookings} completed bookings.`);
    }

    if (parseFloat(cancelRate) > 20) {
      insights.push(`[!]   Cancellation rate of ${cancelRate}% is above the 20% threshold. Review scheduling flexibility and no-show policies.`);
    }

    insights.push(`[i]   Report covers ${dailyRevenue.length} active day(s) in the ${periodLabel.toLowerCase()} window with ${barberCount} active barber(s) on roster.`);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    for (const insight of insights) {
      const lines = doc.splitTextToSize(insight, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 4.8 + 2;
    }
  }

  // ── FINAL FOOTER ──────────────────────────────────────────────────────
  addPageFooter();

  // ── SAVE ──────────────────────────────────────────────────────────────
  const safeName = (saloon?.name || 'salon').replace(/\s+/g, '_').toLowerCase();
  const dateStr  = now.toISOString().split('T')[0];
  doc.save(`${safeName}_analytics_report_${dateStr}.pdf`);
}

// ── Main Component ────────────────────────────────────────────────────────
export default function SaloonAnalyticsPage() {
  const [saloon, setSaloon] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'completed'
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadData = useCallback((saloonId, selectedPeriod) => {
    setLoading(true);
    Promise.all([
      analyticsAPI.getSaloon(saloonId, { period: selectedPeriod }),
      analyticsAPI.getSaloonBarbersPerformance(saloonId, { period: selectedPeriod }),
    ]).then(([aRes, pRes]) => {
      setAnalytics(aRes.data.data);
      setPerformance(pRes.data.data.performance || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    saloonAPI.getMy().then(res => {
      const s = res.data.data.saloon;
      setSaloon(s);
      loadData(s._id, period);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (saloon) loadData(saloon._id, period);
  }, [period, saloon]);

  // ── Computed KPIs ──────────────────────────────────────────────────────
  const ov = analytics?.overview || {};
  const totalBookings = ov.totalAppointments ?? 0;
  const completed = ov.completedAppointments ?? 0;
  const cancelled = ov.cancelledAppointments ?? 0;
  const revenue = ov.totalRevenue ?? 0;
  const cancelRate = totalBookings > 0
    ? ((cancelled / totalBookings) * 100).toFixed(1)
    : '0.0';

  // ── Service breakdown from barber data ────────────────────────────────
  const topServices = analytics?.topServices || [];

  // ── Sort barbers ──────────────────────────────────────────────────────
  const sortedBarbers = [...performance].sort((a, b) =>
    sortBy === 'revenue'
      ? (b.totalRevenue || 0) - (a.totalRevenue || 0)
      : (b.completedBookings || 0) - (a.completedBookings || 0)
  );

  const rankIcon = (i) => {
    if (i === 0) return <Trophy size={14} color="#f59e0b" />;
    if (i === 1) return <Medal size={14} color="#9ca3af" />;
    if (i === 2) return <Award size={14} color="#b45309" />;
    return <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.72rem', color: 'rgba(0,0,0,0.3)', width: '14px', textAlign: 'center' }}>#{i + 1}</span>;
  };

  // ── Bar colors ────────────────────────────────────────────────────────
  const BAR_COLORS = ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db'];

  // ── PDF trigger ───────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!analytics) return;
    setPdfLoading(true);
    try {
      generatePDF({ saloon, analytics, performance, period });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setTimeout(() => setPdfLoading(false), 1200);
    }
  };

  return (
    <DashboardLayout>

      {/* ── EYEBROW ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '0.65rem',
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.45)',
        }}>
          {saloon?.name || 'Salon'} · Analytics
        </span>
      </div>

      {/* ── PAGE HEADER + PERIOD TABS ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#000000',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Analytics &<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>Insights</em>
          </h1>
        </div>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Period selector */}
          <div style={{
            display: 'flex', gap: '0.375rem',
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '50px', padding: '4px',
          }}>
            {PERIODS.map(p => {
              const active = period === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  style={{
                    padding: '0.375rem 1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    background: active ? '#000000' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(0,0,0,0.45)',
                    border: 'none', borderRadius: '50px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Download Report button */}
          <button
            id="download-report-btn"
            onClick={handleDownloadPDF}
            disabled={pdfLoading || loading || !analytics}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.7rem',
              letterSpacing: '0.05em',
              background: pdfLoading || loading || !analytics ? 'rgba(0,0,0,0.08)' : '#000000',
              color: pdfLoading || loading || !analytics ? 'rgba(0,0,0,0.3)' : '#ffffff',
              border: 'none', borderRadius: '50px',
              cursor: pdfLoading || loading || !analytics ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: pdfLoading || loading || !analytics ? 'none' : '0 2px 12px rgba(0,0,0,0.18)',
            }}
            onMouseEnter={e => {
              if (!pdfLoading && !loading && analytics) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.28)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
            }}
          >
            {pdfLoading
              ? <><FileText size={13} />&nbsp;Generating…</>
              : <><Download size={13} />&nbsp;Download Report</>
            }
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
        </div>
      ) : (
        <>
          {/* ── ROW 1: KPI TILES ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <KpiTile
              icon={TrendingUp}
              label="Total Revenue"
              value={`LKR ${revenue.toLocaleString()}`}
              iconBg="#f0fdf4" iconColor="#16a34a"
            />
            <KpiTile
              icon={Calendar}
              label="Total Bookings"
              value={totalBookings}
              sub={`in selected period`}
              iconBg="#eff6ff" iconColor="#2563eb"
            />
            <KpiTile
              icon={CheckCircle2}
              label="Completed"
              value={completed}
              sub={totalBookings > 0 ? `${((completed / totalBookings) * 100).toFixed(1)}% success rate` : ''}
              iconBg="#f0fdf4" iconColor="#16a34a"
            />
            <KpiTile
              icon={XCircle}
              label="Cancellation Rate"
              value={`${cancelRate}%`}
              sub={`${cancelled} cancelled`}
              iconBg="#fef2f2" iconColor="#dc2626"
            />
          </div>

          {/* ── ROW 2: REVENUE + BOOKINGS CHARTS ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem', marginBottom: '1.25rem',
          }}>

            {/* Revenue Bar Chart */}
            <ChartCard
              title="Daily Revenue"
              subtitle={`LKR earnings per day — ${PERIODS.find(p => p.value === period)?.label}`}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.dailyRevenue || []} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis
                    dataKey="_id" stroke="none"
                    tick={{ fill: 'rgba(0,0,0,0.35)', fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                    tickLine={false} axisLine={false}
                  />
                  <YAxis
                    stroke="none"
                    tick={{ fill: 'rgba(0,0,0,0.35)', fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                    tickLine={false} axisLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip prefix="LKR " />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Bookings Area Chart */}
            <ChartCard
              title="Booking Volume"
              subtitle={`Appointment count per day — ${PERIODS.find(p => p.value === period)?.label}`}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics?.dailyRevenue || []}>
                  <defs>
                    <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis
                    dataKey="_id" stroke="none"
                    tick={{ fill: 'rgba(0,0,0,0.35)', fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                    tickLine={false} axisLine={false}
                  />
                  <YAxis
                    stroke="none"
                    tick={{ fill: 'rgba(0,0,0,0.35)', fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                    tickLine={false} axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }} />
                  <Area
                    type="monotone" dataKey="count" name="Bookings"
                    stroke="#000000" strokeWidth={2}
                    fill="url(#bookingsGrad)"
                    dot={false} activeDot={{ r: 4, fill: '#000', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── ROW 3: TOP SERVICES ── */}
          {topServices.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <ChartCard
                title="Top Services"
                subtitle="Booking count by service"
              >
                <ResponsiveContainer width="100%" height={Math.max(180, topServices.length * 48)}>
                  <BarChart
                    data={topServices}
                    layout="vertical"
                    barSize={20}
                    margin={{ left: 20, right: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="none"
                      tick={{ fill: 'rgba(0,0,0,0.35)', fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      tickLine={false} axisLine={false}
                    />
                    <YAxis type="category" dataKey="name" width={130}
                      tick={{ fill: 'rgba(0,0,0,0.65)', fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
                      tickLine={false} axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="count" name="Bookings" radius={[0, 6, 6, 0]}>
                      {topServices.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── ROW 4: BARBER PERFORMANCE TABLE ── */}
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            {/* Table header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Scissors size={16} color="rgba(0,0,0,0.55)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#000', margin: 0 }}>
                    Barber Performance
                  </h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', margin: '2px 0 0 0' }}>
                    Ranked by selected metric
                  </p>
                </div>
              </div>

              {/* Sort toggle */}
              <div style={{
                display: 'flex', gap: '0.375rem',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '50px', padding: '3px',
              }}>
                {[
                  { label: 'By Revenue', value: 'revenue' },
                  { label: 'By Bookings', value: 'completed' },
                ].map(opt => {
                  const active = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      style={{
                        padding: '0.3rem 0.9rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        background: active ? '#000' : 'transparent',
                        color: active ? '#fff' : 'rgba(0,0,0,0.45)',
                        border: 'none', borderRadius: '50px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              {sortedBarbers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <BarChart2 size={36} color="rgba(0,0,0,0.15)" style={{ marginBottom: '0.75rem', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
                    No performance data for this period.
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      {['Rank', 'Stylist', 'Completed', 'Cancelled', 'Revenue'].map(col => (
                        <th key={col} style={{
                          padding: '0.875rem 1.25rem',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: '0.62rem',
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'rgba(0,0,0,0.4)', textAlign: col === 'Rank' ? 'center' : 'left',
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBarbers.map((b, i) => (
                      <tr
                        key={b.barberId}
                        style={{
                          borderBottom: '1px solid rgba(0,0,0,0.04)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Rank */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {rankIcon(i)}
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.06)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 800, fontSize: '0.8rem', color: '#000',
                              overflow: 'hidden', flexShrink: 0,
                            }}>
                              {b.avatar
                                ? <img src={b.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : b.name?.[0]?.toUpperCase()
                              }
                            </div>
                            <span style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 800, fontSize: '0.88rem', color: '#000',
                            }}>
                              {b.name}
                            </span>
                          </div>
                        </td>

                        {/* Completed */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700, fontSize: '0.88rem', color: '#16a34a',
                          }}>
                            <CheckCircle2 size={13} />
                            {b.completedBookings}
                          </span>
                        </td>

                        {/* Cancelled */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700, fontSize: '0.88rem', color: 'rgba(0,0,0,0.4)',
                          }}>
                            <XCircle size={13} />
                            {b.cancelledBookings}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 900, fontSize: '0.92rem', color: '#000',
                          }}>
                            LKR {(b.totalRevenue || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
