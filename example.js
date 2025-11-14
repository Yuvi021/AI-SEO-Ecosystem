// Example usage of the AI SEO Ecosystem

import { AgentManager } from './src/core/AgentManager.js';

async function example() {
  const manager = new AgentManager();
  
  // Analyze a URL
  try {
    console.log('Starting SEO analysis...');
    const results = await manager.processURL('https://example.com');
    
    console.log('\n=== SEO Analysis Complete ===');
    console.log(`Overall Score: ${results.report?.score || 0}/100`);
    console.log(`\nURL: ${results.crawl?.url || 'N/A'}`);
    console.log(`Title: ${results.crawl?.title || 'N/A'}`);
    console.log(`Word Count: ${results.crawl?.content?.wordCount || 0}`);
    
    // Show recommendations
    const recommendations = [
      ...(results.keyword?.recommendations || []),
      ...(results.content?.recommendations || []),
      ...(results.technical?.recommendations || []),
      ...(results.meta?.recommendations || []),
      ...(results.schema?.recommendations || []),
      ...(results.image?.recommendations || [])
    ];
    
    console.log(`\nTotal Recommendations: ${recommendations.length}`);
    
    // Show top 5 recommendations
    console.log('\n=== Top Recommendations ===');
    recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
    
    // Show meta tag optimizations
    if (results.meta) {
      console.log('=== Meta Tag Optimizations ===');
      if (results.meta.title) {
        console.log(`\nTitle:`);
        console.log(`  Current: ${results.meta.title.current || 'Missing'}`);
        console.log(`  Optimized: ${results.meta.title.optimized}`);
      }
      if (results.meta.metaDescription) {
        console.log(`\nMeta Description:`);
        console.log(`  Current: ${results.meta.metaDescription.current || 'Missing'}`);
        console.log(`  Optimized: ${results.meta.metaDescription.optimized}`);
      }
    }
    
    // Report location
    if (results.report?.files) {
      console.log(`\n=== Report Generated ===`);
      console.log(`HTML Report: reports/${results.report.files.html}`);
      console.log(`JSON Report: reports/${results.report.files.json}`);
    }
    
  } catch (error) {
    console.error('Error during analysis:', error.message);
  }
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example();
}

