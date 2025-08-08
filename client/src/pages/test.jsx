import React from 'react';

const Test = () => {
  return (
    <div className="min-h-screen bg-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Speech Bubble - Main Content */}
        <div className="bg-blue-100 rounded-3xl p-8 lg:p-12 shadow-2xl relative max-w-2xl mx-auto">
          {/* Speech bubble tail pointing down and to the right */}
          <div className="absolute -bottom-4 right-8 w-0 h-0 border-l-8 border-t-8 border-b-8 border-transparent border-t-blue-100"></div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-purple-800 mb-8">
            The Better You Manifesto
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-800 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-purple-800 text-lg leading-relaxed font-medium">
                I was built to amplify what makes you exceptional.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-800 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-purple-800 text-lg leading-relaxed font-medium">
                To help you scale with soul – not stress.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-800 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-purple-800 text-lg leading-relaxed font-medium">
                I don't replace your voice – I extend it.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-800 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-purple-800 text-lg leading-relaxed font-medium">
                The better version of your business starts here.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-800 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-purple-800 text-lg leading-relaxed font-medium">
                Let's grow smarter, together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
