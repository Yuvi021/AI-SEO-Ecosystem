import 'dotenv/config';
import KeywordResearchAgent from './src/agents/KeywordResearchAgent.js';

/**
 * Test script for real-time keyword data
 * 
 * Usage:
 * 1. Configure your API in backend/.env
 * 2. Run: node backend/test-keyword-api.js
 */

async function testKeywordResearch() {
  console.log('🔍 Testing Keyword Research Agent with Real-Time Data\n');
  console.log('='.repeat(60));
  
  const agent = new KeywordResearchAgent();
  
  // Check configuration status
  const status = agent.getStatus();
  console.log('\n📊 Configuration Status:');
  console.log(`   Agent: ${status.agent}`);
  console.log(`   Status: ${status.status}`);
  console.log(`   Real-Time Data: ${status.realTimeData ? '✅ ENABLED' : '⚠️  DISABLED (using estimates)'}`);
  console.log(`   Provider: ${status.provider}`);
  console.log(`   Configured: ${status.configured ? '✅ Yes' : '❌ No'}`);
  
  if (status.configured) {
    console.log('\n   Features:');
    Object.entries(status.features).forEach(([feature, enabled]) => {
      console.log(`     ${feature}: ${enabled ? '✅' : '❌'}`);
    });
  } else {
    console.log('\n⚠️  No API configured. Using estimated data.');
    console.log('   To enable real-time data, see: backend/KEYWORD_API_SETUP.md');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🚀 Starting Keyword Research...\n');
  
  // Test with sample keywords
  const seedKeywords = ['seo tools', 'keyword research'];
  
  try {
    const results = await agent.research(seedKeywords, {
      location: 'United States',
      language: 'en'
    });
    
    console.log('✅ Research Complete!\n');
    console.log('='.repeat(60));
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Total Keywords: ${results.summary.totalKeywords}`);
    console.log(`   Average Difficulty: ${results.summary.avgDifficulty}`);
    console.log(`   Total Volume: ${results.summary.totalVolume.toLocaleString()}`);
    console.log(`   Average Volume: ${results.summary.avgVolume.toLocaleString()}`);
    console.log(`   High Opportunities: ${results.summary.opportunities}`);
    
    // Intent breakdown
    console.log('\n🎯 By Intent:');
    Object.entries(results.summary.byIntent).forEach(([intent, count]) => {
      console.log(`   ${intent}: ${count}`);
    });
    
    // Difficulty breakdown
    console.log('\n💪 By Difficulty:');
    console.log(`   Easy (<30): ${results.summary.byDifficulty.easy}`);
    console.log(`   Medium (30-60): ${results.summary.byDifficulty.medium}`);
    console.log(`   Hard (>60): ${results.summary.byDifficulty.hard}`);
    
    // Top opportunities
    console.log('\n🎯 Top 5 High-Opportunity Keywords:');
    const topKeywords = results.keywords
      .filter(kw => kw.opportunity === 'high')
      .slice(0, 5);
    
    if (topKeywords.length > 0) {
      topKeywords.forEach((kw, i) => {
        console.log(`\n   ${i + 1}. ${kw.keyword}`);
        console.log(`      Volume: ${kw.volume.toLocaleString()}`);
        console.log(`      Difficulty: ${kw.difficulty.toFixed(1)}`);
        console.log(`      CPC: $${kw.cpc}`);
        console.log(`      Competition: ${kw.competition}`);
        console.log(`      Intent: ${kw.intent}`);
        console.log(`      Trend: ${kw.trend}`);
        console.log(`      Source: ${kw.source || 'estimate'}`);
        console.log(`      Real Data: ${kw.realTimeData ? '✅ Yes' : '⚠️  No (estimate)'}`);
      });
    } else {
      console.log('   No high-opportunity keywords found.');
    }
    
    // Long-tail keywords
    if (results.longTail.length > 0) {
      console.log(`\n📝 Long-Tail Keywords (${results.longTail.length} found):`);
      results.longTail.slice(0, 5).forEach((kw, i) => {
        console.log(`   ${i + 1}. ${kw.keyword} (Vol: ${kw.volume.toLocaleString()}, Diff: ${kw.difficulty.toFixed(1)})`);
      });
    }
    
    // Question keywords
    if (results.questions.length > 0) {
      console.log(`\n❓ Question Keywords (${results.questions.length} found):`);
      results.questions.slice(0, 5).forEach((kw, i) => {
        console.log(`   ${i + 1}. ${kw.keyword} (Vol: ${kw.volume.toLocaleString()})`);
      });
    }
    
    // Clusters
    if (results.clusters.length > 0) {
      console.log(`\n🗂️  Keyword Clusters (${results.clusters.length} found):`);
      results.clusters.slice(0, 3).forEach((cluster, i) => {
        console.log(`   ${i + 1}. ${cluster.topic} (${cluster.keywords.length} keywords, ${cluster.totalVolume.toLocaleString()} total volume)`);
      });
    }
    
    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach((rec, i) => {
        console.log(`\n   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`);
        console.log(`      ${rec.message}`);
        console.log(`      Action: ${rec.action}`);
        if (rec.keywords) {
          console.log(`      Keywords: ${rec.keywords.slice(0, 3).join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test Complete!\n');
    
    if (!status.realTimeData) {
      console.log('💡 TIP: Configure an API to get real-time data instead of estimates.');
      console.log('   See: backend/KEYWORD_API_SETUP.md\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error during keyword research:');
    console.error(`   ${error.message}`);
    console.error('\n   Stack trace:');
    console.error(error.stack);
  }
}

// Run the test
testKeywordResearch().catch(console.error);
