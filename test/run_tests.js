import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { glob } from 'node:fs/promises';

console.log('🧪 Starting ResumeTracker Production Test Suite...');

run({
  files: ['test/ats-matcher.test.js', 'test/storage-service.test.js', 'test/scoring-explainer.test.js'],
})
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(new spec())
  .pipe(process.stdout);
