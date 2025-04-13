
import React from 'react';
import Layout from '@/components/Layout';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">About "Does It Have Smut?"</h1>
        <Separator className="my-6" />
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed mb-4">
            "Does It Have Smut?" was created to help readers make informed choices about the books they read. We understand that everyone has different comfort levels when it comes to adult content in literature.
          </p>
          <p className="text-lg leading-relaxed mb-4">
            Our goal is to provide a judgment-free resource that allows readers to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Find out if a book contains sexual content before purchasing or reading</li>
            <li>Identify specific pages or chapters to skip if they prefer to avoid explicit scenes</li>
            <li>Make reading choices that align with their personal preferences or values</li>
          </ul>
          <p className="text-lg leading-relaxed">
            We believe that everyone should be able to enjoy literature on their own terms.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What We Mean By "Smut"</h2>
          <p className="text-lg leading-relaxed mb-4">
            We use the term "smut" to refer to explicit sexual content in books. Our content indicators are categorized as:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-green-600">None</h3>
              <p>No explicit sexual content. May contain romance, kissing, or implied intimacy.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-blue-600">Mild</h3>
              <p>Contains some sensual scenes, but without explicit details. "Closed door" or fade-to-black scenes.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-yellow-600">Moderate</h3>
              <p>Contains detailed romantic/sexual scenes with some explicit language or descriptions.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 text-red-600">Explicit</h3>
              <p>Contains highly detailed sexual scenes with explicit language and descriptions.</p>
            </div>
          </div>
          <p className="text-lg leading-relaxed">
            Our goal is not to censor or judge books based on their content, but to provide information so readers can make their own choices.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Community Driven</h2>
          <p className="text-lg leading-relaxed mb-4">
            "Does It Have Smut?" is a community-driven platform. Our database grows through contributions from readers like you who help identify and categorize content in books.
          </p>
          <p className="text-lg leading-relaxed">
            We rely on our community to provide accurate information, and we encourage respectful discussion about book content. If you'd like to contribute, please visit our <a href="/contribute" className="text-primary hover:underline">Contribute</a> page.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default About;
