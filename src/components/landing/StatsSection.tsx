import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const useCountUp = (end: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, start]);

  return count;
};

export const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const stats = [
    { value: 50000, labelKey: "landing.stats.students", suffix: "+" },
    { value: 100, labelKey: "landing.stats.countries", suffix: "+" },
    { value: 98, labelKey: "landing.stats.satisfaction", suffix: "%" },
    { value: 500, labelKey: "landing.stats.partners", suffix: "+" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
      <section ref={sectionRef} className="py-16 md:py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
                <StatCard
                    key={stat.labelKey}
                    value={stat.value}
                    label={t(stat.labelKey)}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                    delay={index * 200}
                />
            ))}
          </div>
        </div>
      </section>
  );
};

const StatCard = ({
                    value,
                    label,
                    suffix,
                    isVisible,
                    delay
                  }: {
  value: number;
  label: string;
  suffix: string;
  isVisible: boolean;
  delay: number;
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const count = useCountUp(value, 2000, shouldAnimate);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldAnimate(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
      <div className="text-center">
        <div className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-sm md:text-base">{label}</div>
      </div>
  );
};