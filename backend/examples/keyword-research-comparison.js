import 'dotenv/config';
import KeywordResearchAgent from '../src/agents/KeywordResearchAgent.js';

/**
 * Side-by-side comparison: Static estimates vs Real-time data
 * 
 * This example shows the difference between estimated and real keyword data
 */

async function compareKeywordData() {
  console.log('📊 Keyword Research: Static vs Real-Time Data Comparison\n');
  console.log('='.repeat(70));
  
  const agent = new KeywordResearchAgent();
  const status = agent.getStatus();
  
  console.log('\n🔧 Current Configuration:');
  console.log(`   Provider: ${status.provider}`);
  console.log(`   Real-Time Data: ${status.realTimeData ? '✅ ENABLED' : '⚠️  DISABLED'}`);
  console.log(`   Data Source: ${status.realTimeData ? 'Live API' : 'Intelligent Estimates'}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 Researching: "seo tools", "keyword research", "backlink checker"\n');
  
  const keywords = ['seo tools', 'keyword research', 'backlink checker'];
  
  try {
    const results = await agent.research(keywords, {
      location: 'United States',
      language: 'en'
    });
    
    console.log('✅ Research Complete!\n');
    console.log('='.repeat(70));
    
    // Show comparison for each keyword
    console.log('\n📈 Keyword Data Comparison:\n');
    
    results.keywords.slice(0, 10).forEach((kw, i) => {
      const dataType = kw.realTimeData ? '🟢 REAL-TIME' : '🟡 ESTIMATED';
      
      console.log(`${i + 1}. ${kw.keyword}`);
      console.log(`   Data Type: ${dataType}`);
      console.log(`   Source: ${kw.source || 'estimate'}`);
      console.log(`   Volume: ${kw.volume.toLocaleString()} searches/month`);
      console.log(`   Difficulty: ${kw.difficulty.toFixed(1)}/100`);
      console.log(`   CPC: $${kw.cpc}`);
      console.log(`   Competition: ${kw.competition}`);
      console.log(`   Intent: ${kw.intent}`);
      console.log(`   Trend: ${kw.trend}`);
      console.log(`   Opportunity: ${kw.opportunity}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    
    // Explain the difference
    if (status.realTimeData) {
      console.log('\n✅ You are using REAL-TIME data from ' + status.provider);
      console.log('\nWhat this means:');
      console.log('   • Search volumes are actual Google data');
      console.log('   • CPC values are real advertising costs');
      console.log('   • Competition levels reflect actual market conditions');
      console.log('   • Difficulty scores are calculated from real SERP data');
      console.log('   • Trends show actual 12-month search patterns');
      console.log('\n💡 This data is accurate and actionable for SEO strategy!');
    } else {
      console.log('\n⚠️  You are using ESTIMATED data (no API configured)');
      console.log('\nWhat this means:');
      console.log('   • Search volumes are estimated from word count patterns');
      console.log('   • CPC values are estimated from keyword intent');
      console.log('   • Competition is calculated from difficulty estimates');
      console.log('   • Difficulty is based on keyword length and patterns');
      console.log('   • Trends are marked as "stable" (no historical data)');
      console.log('\n💡 To get REAL data, configure an API:');
      console.log('   1. Sign up at https://dataforseo.com/ (recommended)');
      console.log('   2. Add credentials to backend/.env:');
      console.log('      KEYWORD_DATA_PROVIDER=dataforseo');
      console.log('      DATAFORSEO_LOGIN=your_email@example.com');
      console.log('      DATAFORSEO_PASSWORD=your_password');
      console.log('   3. Restart backend');
      console.log('\n   See: backend/KEYWORD_API_SETUP.md for details');
    }
    
    console.log('\n' + '='.repeat(70));
    
    // Show summary
    console.log('\n📊 Research Summary:');
    console.log(`   Total Keywords: ${results.summary.totalKeywords}`);
    console.log(`   Total Search Volume: ${results.summary.totalVolume.toLocaleString()}`);
    console.log(`   Average Difficulty: ${results.summary.avgDifficulty}`);
    console.log(`   High Opportunities: ${results.summary.opportunities}`);
    
    // Show data quality indicator
    const realDataCount = results.keywords.filter(kw => kw.realTimeData).length;
    const dataQuality = realDataCount === results.keywords.length ? 'Excellent' :
                       realDataCount > 0 ? 'Mixed' : 'Estimated';
    
    console.log(`\n   Data Quality: ${dataQuality}`);
    console.log(`   Real-Time Keywords: ${realDataCount}/${results.keywords.length}`);
    
    console.log('\n' + '='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run comparison
compareKeywordData().catch(console.error);
