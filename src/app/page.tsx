export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">DoneDep</h1>
        <p className="text-blue-100">Autonomous Deployment Platform</p>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Deploy with Confidence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your deployment process with our all-in-one platform for domains, 
            databases, email services, and seamless integration.
          </p>
        </section>
        
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Domain Management</h3>
            <p className="text-gray-600">Register and manage domains with integrated DNS configuration.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Payment Processing</h3>
            <p className="text-gray-600">Stripe Connect integration for seamless payment handling.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Email Services</h3>
            <p className="text-gray-600">Native SMTP server with campaign management and analytics.</p>
          </div>
        </section>
        
        <section className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <div className="space-x-4">
            <a href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
              Sign Up
            </a>
            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50">
              Learn More
            </button>
          </div>
        </section>
      </main>
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 DoneDep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
