// Wait for the visible correct-answer feedback before sending another answer.
module.exports=async function settle(page){
 if(page.feedbackClock)await page.clock.runFor(400);
 else await page.waitForFunction(()=>!transitioning);
};
