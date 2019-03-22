var title = element(by.css('h1'));;
var EnterText = element(by.css('input[placeholder="Enter phrase..."]'));
var result = element(by.id('translation'));
var hyphenate = element(by.css('input[type="checkbox"]'));
beforeEach( function() {
    browser.get('http://localhost:4200/');
    browser.sleep(1000);
});
describe('Translate the given words starts with Consonants to Pig Latin ', function (){

it('Should translate consonants with hyphenate ', function (){
    EnterText.sendKeys('Darling');
    expect(result.getText()).toEqual('Arling-day');
   
}); 


it('Should translate word starts with consonant cluster without hyphenate ', function (){
    
    hyphenate.isSelected().then(selected => {
            if(selected) {
                hyphenate.click(); 
                EnterText.sendKeys('Glucosamine');
                expect(result.getText()).toEqual('Ucosamineglay');
        
            } else {
                EnterText.sendKeys('glucosamine');
                expect(result.getText()).toEqual('Ucosamineglay');
            }
            
        });
    
}); 

it('Should translate  words starts with Vowels  without hyphenate ', function (){
   
    hyphenate.isSelected().then(selected => {
        if(selected) {
            hyphenate.click(); 
            EnterText.sendKeys('Identical');
            expect(result.getText()).toEqual('Identicalay');
    
        } else {
            EnterText.sendKeys('Identical');
            expect(result.getText()).toEqual('Identicalay');
        }
        
    });
}); 
it('Should translate words starts with Vowels with hyphenate ', function (){
    EnterText.sendKeys('Interview'); 
    expect(result.getText()).toEqual('Interview-ay');
   
});

it('Should translate words starts and ends Vowels with hyphenate ', function (){
    EnterText.sendKeys('employee'); 
    expect(result.getText()).toEqual('employee-way');
   
}); 
it('Should translate words starts and ends wtih Vowels without hyphenate ', function (){
   
    
    hyphenate.isSelected().then(selected => {
        if(selected) {
            hyphenate.click(); 
            EnterText.sendKeys('america');
            expect(result.getText()).toEqual('americaway');
    
        } else {
            EnterText.sendKeys('america');
            expect(result.getText()).toEqual('americaway');
        }
        
    });
}); 

});