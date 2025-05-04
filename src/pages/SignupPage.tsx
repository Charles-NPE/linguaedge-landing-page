
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, GraduationCap } from "lucide-react";

const SignupPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create your account
          </CardTitle>
          <CardDescription>
            Choose your role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/signup/teacher" className="block w-full">
            <Button 
              variant="default" 
              className="w-full h-16 text-lg bg-primary hover:bg-primary/90 flex justify-between items-center"
            >
              <span>Teachers / Profesores</span>
              <UserCheck className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/signup/student" className="block w-full">
            <Button 
              variant="default" 
              className="w-full h-16 text-lg bg-accent hover:bg-accent/90 flex justify-between items-center"
            >
              <span>Students / Estudiantes</span>
              <GraduationCap className="h-5 w-5" />
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
