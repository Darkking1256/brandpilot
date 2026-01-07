import { NextRequest, NextResponse } from "next/server"

// Simple PDF export using HTML to PDF conversion
// In production, you might want to use a library like puppeteer or jsPDF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dateRange, metrics, comparisonMetrics, percentageChanges } = body

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      background: #f9fafb;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    .metric-label {
      color: #6b7280;
      margin-top: 5px;
    }
    .comparison {
      display: flex;
      align-items: center;
      margin-top: 10px;
      font-size: 14px;
    }
    .positive {
      color: #10b981;
    }
    .negative {
      color: #ef4444;
    }
    .date-range {
      color: #6b7280;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <div class="date-range">
    Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}
  </div>

  <h2>Key Metrics</h2>
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-value">${metrics.publishedPosts}</div>
      <div class="metric-label">Published Posts</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.publishedPosts >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.publishedPosts >= 0 ? '+' : ''}${percentageChanges.publishedPosts.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.activeCampaigns}</div>
      <div class="metric-label">Active Campaigns</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.activeCampaigns >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.activeCampaigns >= 0 ? '+' : ''}${percentageChanges.activeCampaigns.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
    <div class="metric-card">
      <div class="metric-value">$${metrics.totalAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div class="metric-label">Total Ad Spend</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.totalAdSpend >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalAdSpend >= 0 ? '+' : ''}${percentageChanges.totalAdSpend.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.totalImpressions.toLocaleString()}</div>
      <div class="metric-label">Total Impressions</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.totalImpressions >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalImpressions >= 0 ? '+' : ''}${percentageChanges.totalImpressions.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.totalClicks.toLocaleString()}</div>
      <div class="metric-label">Total Clicks</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.totalClicks >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalClicks >= 0 ? '+' : ''}${percentageChanges.totalClicks.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.avgCTR.toFixed(2)}%</div>
      <div class="metric-label">Average CTR</div>
      ${percentageChanges ? `
        <div class="comparison">
          <span class="${percentageChanges.avgCTR >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.avgCTR >= 0 ? '+' : ''}${percentageChanges.avgCTR.toFixed(1)}%
          </span>
          <span style="margin-left: 5px; color: #6b7280;">vs previous</span>
        </div>
      ` : ''}
    </div>
  </div>

  ${comparisonMetrics ? `
    <h2>Period Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current Period</th>
          <th>Previous Period</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Published Posts</td>
          <td>${metrics.publishedPosts}</td>
          <td>${comparisonMetrics.publishedPosts}</td>
          <td class="${percentageChanges.publishedPosts >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.publishedPosts >= 0 ? '+' : ''}${percentageChanges.publishedPosts.toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td>Active Campaigns</td>
          <td>${metrics.activeCampaigns}</td>
          <td>${comparisonMetrics.activeCampaigns}</td>
          <td class="${percentageChanges.activeCampaigns >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.activeCampaigns >= 0 ? '+' : ''}${percentageChanges.activeCampaigns.toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td>Total Ad Spend</td>
          <td>$${metrics.totalAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>$${comparisonMetrics.totalAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="${percentageChanges.totalAdSpend >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalAdSpend >= 0 ? '+' : ''}${percentageChanges.totalAdSpend.toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td>Total Impressions</td>
          <td>${metrics.totalImpressions.toLocaleString()}</td>
          <td>${comparisonMetrics.totalImpressions.toLocaleString()}</td>
          <td class="${percentageChanges.totalImpressions >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalImpressions >= 0 ? '+' : ''}${percentageChanges.totalImpressions.toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td>Total Clicks</td>
          <td>${metrics.totalClicks.toLocaleString()}</td>
          <td>${comparisonMetrics.totalClicks.toLocaleString()}</td>
          <td class="${percentageChanges.totalClicks >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.totalClicks >= 0 ? '+' : ''}${percentageChanges.totalClicks.toFixed(1)}%
          </td>
        </tr>
        <tr>
          <td>Average CTR</td>
          <td>${metrics.avgCTR.toFixed(2)}%</td>
          <td>${comparisonMetrics.avgCTR.toFixed(2)}%</td>
          <td class="${percentageChanges.avgCTR >= 0 ? 'positive' : 'negative'}">
            ${percentageChanges.avgCTR >= 0 ? '+' : ''}${percentageChanges.avgCTR.toFixed(1)}%
          </td>
        </tr>
      </tbody>
    </table>
  ` : ''}

  <div class="footer">
    Generated on ${new Date().toLocaleString()}<br>
    MarketPilot AI Analytics Report
  </div>
</body>
</html>
    `

    // For a simple implementation, we'll return HTML
    // In production, use a library like puppeteer to convert HTML to PDF
    // For now, return HTML that can be printed to PDF by the browser
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    )
  }
}

