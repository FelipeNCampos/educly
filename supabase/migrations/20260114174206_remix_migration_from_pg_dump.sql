CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: ai_tool_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ai_tool_category AS ENUM (
    'conversacional',
    'imagem',
    'video',
    'audio',
    'codigo',
    'busca',
    'design'
);


--
-- Name: award_certificate(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.award_certificate(p_tool_slug text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tool_id uuid;
  v_completed_count int;
  v_user_id uuid;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get tool ID
  SELECT id INTO v_tool_id FROM ai_tools WHERE slug = p_tool_slug;
  
  IF v_tool_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Count completed phases for this tool
  SELECT COUNT(*) INTO v_completed_count
  FROM user_progress up
  JOIN trail_phases tp ON up.phase_id = tp.id
  WHERE up.user_id = v_user_id
    AND tp.ai_tool_id = v_tool_id
    AND up.completed = true;
  
  -- Verify all 28 phases are completed
  IF v_completed_count < 28 THEN
    RETURN false;
  END IF;
  
  -- Award certificate (ON CONFLICT prevents duplicates)
  INSERT INTO user_certificates (user_id, tool_slug, certificate_type)
  VALUES (v_user_id, p_tool_slug, 'completion')
  ON CONFLICT DO NOTHING;
  
  RETURN true;
END;
$$;


--
-- Name: check_premium_access(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_premium_access(user_email text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get user email if not provided
  IF user_email IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  ELSE
    v_email := user_email;
  END IF;
  
  -- Whitelist de emails com acesso gratuito
  IF v_email IN ('ferramentasdigitais1000@gmail.com') THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se tem acesso premium na tabela
  RETURN EXISTS (
    SELECT 1 FROM user_premium_access 
    WHERE user_id = v_user_id AND is_premium = true
  );
END;
$$;


--
-- Name: generate_challenge_certificate(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_challenge_certificate(p_challenge_id uuid, p_user_full_name text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id UUID;
  v_completed_days INTEGER;
  v_total_days INTEGER;
  v_challenge_slug TEXT;
  v_certificate_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Obter slug do desafio e total de dias
  SELECT slug, duration_days INTO v_challenge_slug, v_total_days
  FROM challenges WHERE id = p_challenge_id;
  
  IF v_challenge_slug IS NULL THEN
    RETURN NULL;
  END IF;

  -- Contar dias completados
  SELECT COUNT(*) INTO v_completed_days
  FROM user_day_progress udp
  JOIN challenge_days cd ON udp.challenge_day_id = cd.id
  WHERE udp.user_id = v_user_id
    AND cd.challenge_id = p_challenge_id
    AND udp.completed = true;

  -- Verificar se completou todos os dias
  IF v_completed_days < v_total_days THEN
    RETURN NULL;
  END IF;

  -- Gerar certificado (evita duplicatas)
  INSERT INTO user_certificates (user_id, tool_slug, certificate_type, challenge_id, user_full_name)
  VALUES (v_user_id, v_challenge_slug, 'completion', p_challenge_id, p_user_full_name)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_certificate_id;

  RETURN v_certificate_id;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;


--
-- Name: update_user_streak(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_streak() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.user_streaks
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE);
  ELSE
    IF v_last_date = CURRENT_DATE THEN
      -- Already updated today, do nothing
      NULL;
    ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      v_current_streak := v_current_streak + 1;
      IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
      END IF;
      UPDATE public.user_streaks
      SET current_streak = v_current_streak,
          longest_streak = v_longest_streak,
          last_activity_date = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE public.user_streaks
      SET current_streak = 1,
          last_activity_date = CURRENT_DATE,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    icon_name text NOT NULL,
    color_gradient text NOT NULL,
    category public.ai_tool_category NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: challenge_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_days (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid NOT NULL,
    day_number integer NOT NULL,
    ai_tool_id uuid,
    title text NOT NULL,
    description text,
    focus_area text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    image_url text,
    duration_days integer DEFAULT 28,
    difficulty text DEFAULT 'iniciante'::text,
    challenge_type text NOT NULL,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    ai_tool_context text,
    created_at timestamp with time zone DEFAULT now(),
    ai_assistant_type text,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    hourly_rate numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text,
    platform text,
    external_url text,
    category text,
    icon_name text DEFAULT 'Briefcase'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);


--
-- Name: lesson_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phase_id uuid,
    step_number integer NOT NULL,
    step_type text NOT NULL,
    title text NOT NULL,
    content text,
    image_url text,
    quiz_question text,
    quiz_options jsonb,
    quiz_feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    challenge_day_id uuid,
    CONSTRAINT lesson_steps_step_type_check CHECK ((step_type = ANY (ARRAY['content'::text, 'quiz'::text])))
);


--
-- Name: personalized_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personalized_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brief jsonb DEFAULT '{}'::jsonb NOT NULL,
    generated_plan jsonb DEFAULT '[]'::jsonb NOT NULL,
    challenge_id uuid,
    version integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: trail_phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trail_phases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ai_tool_id uuid NOT NULL,
    phase_number integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    video_url text,
    task_description text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_slug text NOT NULL,
    certificate_type text DEFAULT 'completion'::text NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    certificate_url text,
    challenge_id uuid,
    user_full_name text
);


--
-- Name: user_challenge_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_challenge_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    current_day integer DEFAULT 1,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_day_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_day_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_day_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_lesson_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_lesson_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    step_id uuid NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    selected_options jsonb,
    is_correct boolean,
    answered_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_onboarding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_onboarding (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tutorial_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_premium_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_premium_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    is_premium boolean DEFAULT false,
    purchased_at timestamp with time zone,
    hotmart_transaction_id text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    phase_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_step_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_step_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    step_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_streaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_streaks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_activity_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_tools ai_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_pkey PRIMARY KEY (id);


--
-- Name: ai_tools ai_tools_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_slug_key UNIQUE (slug);


--
-- Name: challenge_days challenge_days_challenge_id_day_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_days
    ADD CONSTRAINT challenge_days_challenge_id_day_number_key UNIQUE (challenge_id, day_number);


--
-- Name: challenge_days challenge_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_days
    ADD CONSTRAINT challenge_days_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_slug_key UNIQUE (slug);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: lesson_steps lesson_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_steps
    ADD CONSTRAINT lesson_steps_pkey PRIMARY KEY (id);


--
-- Name: personalized_plans personalized_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalized_plans
    ADD CONSTRAINT personalized_plans_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: trail_phases trail_phases_ai_tool_id_phase_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_phases
    ADD CONSTRAINT trail_phases_ai_tool_id_phase_number_key UNIQUE (ai_tool_id, phase_number);


--
-- Name: trail_phases trail_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_phases
    ADD CONSTRAINT trail_phases_pkey PRIMARY KEY (id);


--
-- Name: user_challenge_progress unique_user_challenge; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id);


--
-- Name: user_day_progress unique_user_day_progress; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_progress
    ADD CONSTRAINT unique_user_day_progress UNIQUE (user_id, challenge_day_id);


--
-- Name: user_step_progress unique_user_step; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_step_progress
    ADD CONSTRAINT unique_user_step UNIQUE (user_id, step_id);


--
-- Name: user_certificates user_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_certificates
    ADD CONSTRAINT user_certificates_pkey PRIMARY KEY (id);


--
-- Name: user_certificates user_certificates_user_id_tool_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_certificates
    ADD CONSTRAINT user_certificates_user_id_tool_slug_key UNIQUE (user_id, tool_slug);


--
-- Name: user_challenge_progress user_challenge_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_pkey PRIMARY KEY (id);


--
-- Name: user_challenge_progress user_challenge_progress_user_id_challenge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_user_id_challenge_id_key UNIQUE (user_id, challenge_id);


--
-- Name: user_day_progress user_day_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_progress
    ADD CONSTRAINT user_day_progress_pkey PRIMARY KEY (id);


--
-- Name: user_day_progress user_day_progress_user_id_challenge_day_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_progress
    ADD CONSTRAINT user_day_progress_user_id_challenge_day_id_key UNIQUE (user_id, challenge_day_id);


--
-- Name: user_lesson_attempts user_lesson_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_attempts
    ADD CONSTRAINT user_lesson_attempts_pkey PRIMARY KEY (id);


--
-- Name: user_onboarding user_onboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_onboarding
    ADD CONSTRAINT user_onboarding_pkey PRIMARY KEY (id);


--
-- Name: user_onboarding user_onboarding_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_onboarding
    ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);


--
-- Name: user_premium_access user_premium_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_premium_access
    ADD CONSTRAINT user_premium_access_pkey PRIMARY KEY (id);


--
-- Name: user_premium_access user_premium_access_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_premium_access
    ADD CONSTRAINT user_premium_access_user_id_key UNIQUE (user_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_phase_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_phase_id_key UNIQUE (user_id, phase_id);


--
-- Name: user_step_progress user_step_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_step_progress
    ADD CONSTRAINT user_step_progress_pkey PRIMARY KEY (id);


--
-- Name: user_step_progress user_step_progress_user_id_step_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_step_progress
    ADD CONSTRAINT user_step_progress_user_id_step_id_key UNIQUE (user_id, step_id);


--
-- Name: user_streaks user_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (id);


--
-- Name: user_streaks user_streaks_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_user_id_key UNIQUE (user_id);


--
-- Name: idx_lesson_steps_challenge_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_steps_challenge_day ON public.lesson_steps USING btree (challenge_day_id);


--
-- Name: idx_lesson_steps_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_steps_phase_id ON public.lesson_steps USING btree (phase_id);


--
-- Name: idx_lesson_steps_step_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_steps_step_number ON public.lesson_steps USING btree (phase_id, step_number);


--
-- Name: idx_personalized_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personalized_plans_user_id ON public.personalized_plans USING btree (user_id);


--
-- Name: idx_trail_phases_phase_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trail_phases_phase_number ON public.trail_phases USING btree (phase_number);


--
-- Name: idx_trail_phases_tool; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trail_phases_tool ON public.trail_phases USING btree (ai_tool_id);


--
-- Name: idx_user_lesson_attempts_step_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lesson_attempts_step_id ON public.user_lesson_attempts USING btree (step_id);


--
-- Name: idx_user_lesson_attempts_user_step; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lesson_attempts_user_step ON public.user_lesson_attempts USING btree (user_id, step_id);


--
-- Name: idx_user_progress_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_completed ON public.user_progress USING btree (completed);


--
-- Name: idx_user_progress_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_phase ON public.user_progress USING btree (phase_id);


--
-- Name: idx_user_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user ON public.user_progress USING btree (user_id);


--
-- Name: idx_user_step_progress_step_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_step_progress_step_id ON public.user_step_progress USING btree (step_id);


--
-- Name: idx_user_step_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_step_progress_user_id ON public.user_step_progress USING btree (user_id);


--
-- Name: user_step_progress update_streak_on_step_completion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_streak_on_step_completion AFTER INSERT OR UPDATE ON public.user_step_progress FOR EACH ROW WHEN ((new.completed = true)) EXECUTE FUNCTION public.update_user_streak();


--
-- Name: challenge_days challenge_days_ai_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_days
    ADD CONSTRAINT challenge_days_ai_tool_id_fkey FOREIGN KEY (ai_tool_id) REFERENCES public.ai_tools(id);


--
-- Name: challenge_days challenge_days_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_days
    ADD CONSTRAINT challenge_days_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: lesson_steps lesson_steps_challenge_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_steps
    ADD CONSTRAINT lesson_steps_challenge_day_id_fkey FOREIGN KEY (challenge_day_id) REFERENCES public.challenge_days(id);


--
-- Name: lesson_steps lesson_steps_phase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_steps
    ADD CONSTRAINT lesson_steps_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES public.trail_phases(id) ON DELETE CASCADE;


--
-- Name: personalized_plans personalized_plans_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personalized_plans
    ADD CONSTRAINT personalized_plans_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trail_phases trail_phases_ai_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trail_phases
    ADD CONSTRAINT trail_phases_ai_tool_id_fkey FOREIGN KEY (ai_tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE;


--
-- Name: user_certificates user_certificates_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_certificates
    ADD CONSTRAINT user_certificates_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id);


--
-- Name: user_challenge_progress user_challenge_progress_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: user_day_progress user_day_progress_challenge_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_day_progress
    ADD CONSTRAINT user_day_progress_challenge_day_id_fkey FOREIGN KEY (challenge_day_id) REFERENCES public.challenge_days(id) ON DELETE CASCADE;


--
-- Name: user_lesson_attempts user_lesson_attempts_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_attempts
    ADD CONSTRAINT user_lesson_attempts_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.lesson_steps(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_phase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES public.trail_phases(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_step_progress user_step_progress_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_step_progress
    ADD CONSTRAINT user_step_progress_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.lesson_steps(id) ON DELETE CASCADE;


--
-- Name: ai_tools Anyone can view AI tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view AI tools" ON public.ai_tools FOR SELECT USING (true);


--
-- Name: challenges Anyone can view active challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING ((is_active = true));


--
-- Name: jobs Anyone can view active jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING ((is_active = true));


--
-- Name: challenge_days Anyone can view challenge days; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view challenge days" ON public.challenge_days FOR SELECT USING (true);


--
-- Name: lesson_steps Anyone can view lesson steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view lesson steps" ON public.lesson_steps FOR SELECT USING (true);


--
-- Name: trail_phases Anyone can view trail phases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view trail phases" ON public.trail_phases FOR SELECT USING (true);


--
-- Name: chat_messages Users can delete own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_lesson_attempts Users can insert own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own attempts" ON public.user_lesson_attempts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_challenge_progress Users can insert own challenge progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own challenge progress" ON public.user_challenge_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_day_progress Users can insert own day progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own day progress" ON public.user_day_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_messages Users can insert own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: personalized_plans Users can insert own plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own plans" ON public.personalized_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_progress Users can insert own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_step_progress Users can insert own step progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own step progress" ON public.user_step_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_streaks Users can insert own streaks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own streaks" ON public.user_streaks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_onboarding Users can insert their own onboarding status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own onboarding status" ON public.user_onboarding FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_challenge_progress Users can update own challenge progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own challenge progress" ON public.user_challenge_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_day_progress Users can update own day progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own day progress" ON public.user_day_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: personalized_plans Users can update own plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own plans" ON public.personalized_plans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_progress Users can update own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_step_progress Users can update own step progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own step progress" ON public.user_step_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_streaks Users can update own streaks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own streaks" ON public.user_streaks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_onboarding Users can update their own onboarding status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own onboarding status" ON public.user_onboarding FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_lesson_attempts Users can view own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own attempts" ON public.user_lesson_attempts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_certificates Users can view own certificates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own certificates" ON public.user_certificates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_challenge_progress Users can view own challenge progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own challenge progress" ON public.user_challenge_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_day_progress Users can view own day progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own day progress" ON public.user_day_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can view own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: personalized_plans Users can view own plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own plans" ON public.personalized_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_premium_access Users can view own premium status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own premium status" ON public.user_premium_access FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_progress Users can view own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_step_progress Users can view own step progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own step progress" ON public.user_step_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_streaks Users can view own streaks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own streaks" ON public.user_streaks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_onboarding Users can view their own onboarding status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own onboarding status" ON public.user_onboarding FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_days; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_days ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: personalized_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personalized_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: trail_phases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trail_phases ENABLE ROW LEVEL SECURITY;

--
-- Name: user_certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: user_challenge_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_day_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_day_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_lesson_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_lesson_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_onboarding; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

--
-- Name: user_premium_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_premium_access ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_step_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_step_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_streaks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;