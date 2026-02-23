import React from 'react';

const features = [
    {
        title: 'Instant Deployments',
        description: 'Push your code and watch it go live globally within seconds. No complex CI/CD pipelines needed.',
        icon: '🚀',
    },
    {
        title: 'Infinite Scale',
        description: 'Built on serverless edge architecture. Handle millions of requests without thinking about infrastructure.',
        icon: '🌐',
    },
    {
        title: 'Ironclad Security',
        description: 'Enterprise-grade encryption and automated DDoS protection out of the box. Sleep easy at night.',
        icon: '🔒',
    },
    {
        title: 'Developer Experience',
        description: 'World-class documentation, intuitive APIs, and comprehensive CLI tools designed by developers for developers.',
        icon: '💻',
    }
];

const Features: React.FC = () => {
    return (
        <section id="features" className="features container">
            <div className="features-header">
                <h2 className="features-title animate-fade-in-up">
                    Everything you need.<br />
                    <span style={{ color: 'var(--text-muted)' }}>Nothing you don't.</span>
                </h2>
            </div>

            <div className="bento-grid">
                {features.map((feature, index) => (
                    <div key={index} className="bento-card glass-panel animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                        <div className="feature-icon-wrapper">
                            {feature.icon}
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-desc">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
